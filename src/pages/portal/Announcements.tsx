import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pin, PinOff, Clock, CheckCheck } from "lucide-react";
import { logActivity } from "@/portal/lib/activity";
import { syncWorkspaceSheet } from "@/portal/lib/google-sync";

interface Announcement { id: string; title: string; body: string; category: string; created_at: string; created_by: string | null; pinned: boolean; scheduled_for: string | null; }
interface ReadReceipt { announcement_id: string; user_id: string; read_at: string; }

const CATEGORIES = ["General", "Client", "HR", "Operations", "Creative", "Performance"];

const Announcements = () => {
  const { user, canManage, isAdmin } = usePortalAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [receipts, setReceipts] = useState<ReadReceipt[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "General", pinned: false, scheduled_for: "" });

  const load = async () => {
    const [ann, read] = await Promise.all([
      supabase
      .from("announcements").select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
      supabase.from("announcement_read_receipts").select("announcement_id,user_id,read_at"),
    ]);
    setItems((ann.data as Announcement[]) ?? []);
    setReceipts((read.data as ReadReceipt[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user || items.length === 0) return;
    const now = new Date();
    const unread = items
      .filter((item) => !item.scheduled_for || new Date(item.scheduled_for) <= now)
      .filter((item) => !receipts.some((receipt) => receipt.announcement_id === item.id && receipt.user_id === user.id))
      .map((item) => ({ announcement_id: item.id, user_id: user.id }));
    if (unread.length === 0) return;
    supabase.from("announcement_read_receipts").upsert(unread, { onConflict: "announcement_id,user_id" }).then(() => load());
  }, [items.length, receipts.length, user?.id]);

  const create = async () => {
    if (!form.title || !form.body) return toast.error("Title and body required");
    const { data, error } = await supabase.from("announcements").insert({
      title: form.title, body: form.body, created_by: user!.id,
      category: form.category,
      pinned: form.pinned,
      scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
    }).select("id,title,category,pinned,scheduled_for,created_by").single();
    if (error) return toast.error(error.message);
    if (data) await Promise.all([
      logActivity({ action: "announcement_posted", entityType: "announcement", entityId: data.id, summary: `Posted announcement “${data.title}”` }),
      syncWorkspaceSheet("announcement", { ...data, action: "posted" }),
    ]);
    toast.success("Posted");
    setForm({ title: "", body: "", category: "General", pinned: false, scheduled_for: "" });
    setOpen(false);
    load();
  };
  const togglePin = async (a: Announcement) => {
    const { error } = await supabase.from("announcements").update({ pinned: !a.pinned }).eq("id", a.id);
    if (error) return toast.error(error.message);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground text-sm">Company updates and news.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New post</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New announcement</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(category) => setForm({ ...form, category })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                <div><Label>Body</Label><Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
                <div className="flex items-center gap-3">
                  <Switch id="pin" checked={form.pinned} onCheckedChange={(v) => setForm({ ...form, pinned: v })} />
                  <Label htmlFor="pin" className="!m-0">Pin to top</Label>
                </div>
                <div>
                  <Label>Schedule for (optional)</Label>
                  <Input type="datetime-local" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to publish immediately.</p>
                </div>
                <Button onClick={create} className="w-full">Post</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="space-y-4">
        {items.length === 0 && <p className="text-muted-foreground text-sm">No announcements yet.</p>}
        {items.map((a) => {
          const scheduled = a.scheduled_for && new Date(a.scheduled_for) > new Date();
          const readCount = receipts.filter((receipt) => receipt.announcement_id === a.id).length;
          return (
            <article key={a.id} className={`p-5 rounded-xl border bg-card/60 ${a.pinned ? "border-blaze/40 ring-1 ring-blaze/20" : "border-foreground/10"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.pinned && <Pin className="w-4 h-4 text-blaze" />}
                    <h3 className="font-display text-xl font-semibold">{a.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-foreground/10 bg-foreground/5 text-muted-foreground">{a.category}</span>
                    {scheduled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-hydro/30 bg-hydro/10 text-hydro inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Scheduled {new Date(a.scheduled_for!).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    {new Date(a.created_at).toLocaleString()}
                    {canManage && <span className="inline-flex items-center gap-1"><CheckCheck className="w-3 h-3" /> {readCount} read</span>}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => togglePin(a)} title={a.pinned ? "Unpin" : "Pin"}>
                      {a.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap">{a.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Announcements;