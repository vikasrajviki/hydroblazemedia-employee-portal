import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import UserAvatar from "@/portal/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Loader2, ShieldCheck } from "lucide-react";

const DEPARTMENTS = ["Creative", "Performance Marketing", "Operations", "Sales", "Finance"];

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Team Member",
};

const Profile = () => {
  const { user, profile, role, refreshProfile } = usePortalAuth();
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setJobTitle(profile?.job_title ?? "");
    setDepartment(profile?.department ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName || null,
      job_title: jobTitle || null,
      department: department || null,
      phone: phone || null,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    refreshProfile();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (error) return toast.error(error.message);
    toast.success("Photo updated");
    refreshProfile();
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-muted-foreground mb-8 text-sm">How your teammates see you across the portal.</p>

      <section className="p-6 rounded-2xl border border-foreground/10 bg-card/60 mb-6 flex items-center gap-6">
        <div className="relative">
          <UserAvatar profile={profile} email={user?.email ?? null} size={96} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-8 w-8 grid place-items-center rounded-full bg-hydro text-white shadow-md hover:scale-105 transition-transform"
            aria-label="Change photo"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-semibold truncate">{profile?.full_name || user?.email}</div>
          <div className="text-sm text-muted-foreground truncate">
            {[profile?.job_title, role ? roleLabel[role] : null].filter(Boolean).join(" • ")}
          </div>
          {role === "admin" && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blaze/30 bg-blaze/10 px-2 py-0.5 text-xs font-medium text-blaze">
              <ShieldCheck className="h-3.5 w-3.5" /> Founder / Administrator
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">{user?.email}</div>
        </div>
      </section>

      <form onSubmit={save} className="p-6 rounded-2xl border border-foreground/10 bg-card/60 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Vikas K S" /></div>
        <div><Label>Job title</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Founder" /></div>
        <div>
          <Label>Department</Label>
          <Select value={department || undefined} onValueChange={setDepartment}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" /></div>
        <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;