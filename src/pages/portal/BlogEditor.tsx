import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload, Trash2 } from "lucide-react";

type Status = "draft" | "published" | "archived";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  status: Status;
  featured: boolean;
  read_minutes: number;
  author_id: string | null;
  published_at: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

const estimateMinutes = (text: string) =>
  Math.max(1, Math.round((text.trim().split(/\s+/).filter(Boolean).length || 0) / 220));

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category: "General",
  tags: "",
  status: "draft" as Status,
  featured: false,
  read_minutes: 1,
};

const BlogEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { user, canManage } = usePortalAuth();

  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    supabase.from("blogs").select("*").eq("id", id!).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      if (data) {
        const row = data as BlogRow;
        setForm({
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt ?? "",
          content: row.content ?? "",
          cover_image_url: row.cover_image_url ?? "",
          category: row.category ?? "General",
          tags: (row.tags ?? []).join(", "),
          status: row.status,
          featured: row.featured,
          read_minutes: row.read_minutes,
        });
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const setTitle = (title: string) =>
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  const setContent = (content: string) =>
    setForm((f) => ({ ...f, content, read_minutes: estimateMinutes(content) }));

  const uploadCover = async (file: File) => {
    const path = `${user!.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("blog-covers").upload(path, file, { upsert: false });
    if (upErr) return toast.error(upErr.message);
    const { data } = await supabase.storage.from("blog-covers").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    if (data?.signedUrl) setForm((f) => ({ ...f, cover_image_url: data.signedUrl }));
  };

  const save = async (opts?: { publish?: boolean }) => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    setBusy(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const nextStatus: Status = opts?.publish ? "published" : form.status;
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      category: form.category || null,
      tags,
      status: nextStatus,
      featured: form.featured,
      read_minutes: form.read_minutes,
      author_id: user!.id,
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
    };
    let error;
    if (isNew) {
      ({ error } = await supabase.from("blogs").insert(payload));
    } else {
      ({ error } = await supabase.from("blogs").update(payload).eq("id", id!));
    }
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(opts?.publish ? "Published" : "Saved");
    navigate("/portal/blogs");
  };

  const remove = async () => {
    if (isNew) return;
    if (!confirm("Delete this blog? This can't be undone.")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id!);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    navigate("/portal/blogs");
  };

  if (!canManage) {
    return <p className="text-sm text-muted-foreground">You don't have permission to edit blogs.</p>;
  }
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/portal/blogs")}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="font-display text-2xl font-bold">{isNew ? "New blog" : "Edit blog"}</h1>
            <p className="text-xs text-muted-foreground">{form.read_minutes} min read · status: {form.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <Button variant="ghost" onClick={remove} className="text-red-400"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>}
          <Button variant="outline" onClick={() => save()} disabled={busy}><Save className="w-4 h-4 mr-2" /> Save</Button>
          <Button onClick={() => save({ publish: true })} disabled={busy} className="bg-hydro hover:bg-hydro/90 text-white">Publish</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }}
              placeholder="my-post-slug"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Public URL: /{form.slug || "your-slug"}</p>
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary shown on the blog list" />
          </div>
          <div>
            <Label>Content (Markdown)</Label>
            <Textarea rows={20} value={form.content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post…" className="font-mono text-sm" />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="seo, marketing, tips" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-foreground/10 bg-card/40">
            <div>
              <Label className="text-sm">Featured</Label>
              <p className="text-[11px] text-muted-foreground">Highlight this post on the blog page</p>
            </div>
            <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
          </div>
          <div>
            <Label>Cover image</Label>
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="Cover" className="mt-2 rounded-lg border border-foreground/10 aspect-video object-cover w-full" />
            )}
            <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer p-3 rounded-lg border border-dashed border-foreground/15 hover:bg-foreground/5">
              <Upload className="w-4 h-4" /> Upload cover image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
              />
            </label>
            <Input
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              placeholder="…or paste an image URL"
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;