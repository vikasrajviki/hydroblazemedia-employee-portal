import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

type Role = "admin" | "manager" | "employee";

interface Invite { id: string; email: string; role: Role; token: string; accepted_at: string | null; created_at: string; }
interface Profile { id: string; email: string; full_name: string | null; }
interface RoleRow { user_id: string; role: Role; }

const Admin = () => {
  const { isAdmin, loading, user } = usePortalAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [i, p, r] = await Promise.all([
      supabase.from("invites").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,email,full_name"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setInvites((i.data as Invite[]) ?? []);
    setProfiles((p.data as Profile[]) ?? []);
    setRoles((r.data as RoleRow[]) ?? []);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!isAdmin) return <Navigate to="/portal" replace />;

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("invites").insert({ email, role });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEmail("");
    toast.success("Invite created");
    load();
  };

  const inviteLink = (token: string) => `${window.location.origin}/portal/accept-invite?token=${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(inviteLink(token));
    toast.success("Link copied");
  };

  const removeInvite = async (id: string) => {
    if (!confirm("Revoke invite?")) return;
    const { error } = await supabase.from("invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const rolesOf = (id: string) => roles.filter((r) => r.user_id === id).map((r) => r.role);
  const highestRole = (id: string): Role => {
    const rs = rolesOf(id);
    if (rs.includes("admin")) return "admin";
    if (rs.includes("manager")) return "manager";
    return "employee";
  };

  const changeRole = async (userId: string, next: Role) => {
    if (userId === user?.id && next !== "admin") {
      if (!confirm("You are about to remove your own admin access. Continue?")) return;
    }
    // Delete all existing roles for user, then insert the new one.
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) return toast.error(delErr.message);
    const { error: insErr } = await supabase.from("user_roles").insert({ user_id: userId, role: next });
    if (insErr) return toast.error(insErr.message);
    toast.success("Role updated");
    load();
  };

  const roleBadge = (r: Role) =>
    r === "admin" ? "bg-blaze/15 text-blaze border-blaze/30"
    : r === "manager" ? "bg-hydro/15 text-hydro border-hydro/30"
    : "bg-foreground/5 text-muted-foreground border-foreground/10";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Team & Invites</h1>

      <section className="mb-8 p-5 rounded-xl border border-foreground/10 bg-card/60">
        <h2 className="font-semibold mb-4">Invite a team member</h2>
        <form onSubmit={invite} className="grid gap-3 md:grid-cols-[1fr_180px_auto] items-end">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={busy}>Create invite</Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Share the generated link with the invitee. They sign up with that email to activate their account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-3">Pending & recent invites</h2>
        <div className="space-y-2">
          {invites.length === 0 && <p className="text-muted-foreground text-sm">No invites yet.</p>}
          {invites.map((iv) => (
            <div key={iv.id} className="p-3 rounded-lg border border-foreground/10 bg-card/60 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{iv.email} <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full border ${roleBadge(iv.role)}`}>{iv.role}</span></div>
                <div className="text-xs text-muted-foreground truncate">{inviteLink(iv.token)}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${iv.accepted_at ? "bg-hydro/15 text-hydro border-hydro/30" : "bg-blaze/15 text-blaze border-blaze/30"}`}>
                {iv.accepted_at ? "Accepted" : "Pending"}
              </span>
              <Button variant="ghost" size="icon" onClick={() => copyLink(iv.token)}><Copy className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => removeInvite(iv.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Team members</h2>
        <div className="space-y-2">
          {profiles.map((p) => {
            const current = highestRole(p.id);
            return (
              <div key={p.id} className="p-3 rounded-lg border border-foreground/10 bg-card/60 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{p.email}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${roleBadge(current)}`}>{current}</span>
                <Select value={current} onValueChange={(v) => changeRole(p.id, v as Role)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Admin;