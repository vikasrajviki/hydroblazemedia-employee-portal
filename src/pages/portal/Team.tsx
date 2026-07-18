import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from "@/portal/UserAvatar";
import { relativeTime } from "@/portal/lib/activity";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Role = "admin" | "manager" | "employee";

interface Profile {
  id: string; email: string; full_name: string | null;
  avatar_url: string | null; job_title: string | null;
  department: string | null; last_active_at: string | null;
}
interface RoleRow { user_id: string; role: Role; }

const DEPT_TINT: Record<string, string> = {
  "Creative": "bg-blaze/15 text-blaze border-blaze/30",
  "Performance Marketing": "bg-hydro/15 text-hydro border-hydro/30",
  "Operations": "bg-foreground/10 text-foreground border-foreground/15",
  "Sales": "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "Finance": "bg-violet-500/15 text-violet-600 border-violet-500/30",
};

const roleLabel: Record<Role, string> = { admin: "Administrator", manager: "Manager", employee: "Team Member" };

const statusOf = (iso: string | null): { label: string; dot: string } => {
  if (!iso) return { label: "Invited", dot: "bg-muted-foreground/40" };
  const min = (Date.now() - new Date(iso).getTime()) / 60000;
  if (min < 10) return { label: "Online", dot: "bg-emerald-500" };
  if (min < 60 * 24) return { label: "Active today", dot: "bg-amber-500" };
  return { label: "Offline", dot: "bg-muted-foreground/40" };
};

const Team = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("id,email,full_name,avatar_url,job_title,department,last_active_at").order("full_name"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      setProfiles((p.data as Profile[]) ?? []);
      setRoles((r.data as RoleRow[]) ?? []);
    })();
  }, []);

  const highest = (id: string): Role => {
    const rs = roles.filter((r) => r.user_id === id).map((r) => r.role);
    if (rs.includes("admin")) return "admin";
    if (rs.includes("manager")) return "manager";
    return "employee";
  };

  const departments = Array.from(new Set(profiles.map((p) => p.department).filter(Boolean))) as string[];
  const filtered = profiles.filter((p) => {
    if (dept !== "all" && p.department !== dept) return false;
    if (!q.trim()) return true;
    const hay = `${p.full_name ?? ""} ${p.email} ${p.job_title ?? ""} ${p.department ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground text-sm">Everyone at HydroBlaze Media.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, title, department…" className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setDept("all")} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${dept === "all" ? "bg-hydro/15 text-hydro border-hydro/40" : "bg-card/60 border-foreground/10 text-muted-foreground hover:text-foreground"}`}>All</button>
          {departments.map((d) => (
            <button key={d} onClick={() => setDept(d)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${dept === d ? "bg-hydro/15 text-hydro border-hydro/40" : "bg-card/60 border-foreground/10 text-muted-foreground hover:text-foreground"}`}>{d}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-foreground/15 bg-card/40">
          <p className="text-muted-foreground">No teammates match your search.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const r = highest(p.id);
            const status = statusOf(p.last_active_at);
            return (
              <article key={p.id} className="p-5 rounded-2xl border border-foreground/10 bg-card/60 hover:border-hydro/30 transition-colors">
                <div className="flex items-start gap-3">
                  <UserAvatar profile={p as any} size={52} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{p.full_name || p.email.split("@")[0]}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.job_title || roleLabel[r]}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                  {p.department && (
                    <span className={`px-2 py-0.5 rounded-full border ${DEPT_TINT[p.department] ?? "bg-foreground/5 text-muted-foreground border-foreground/10"}`}>{p.department}</span>
                  )}
                  <span className="px-2 py-0.5 rounded-full border border-foreground/10 bg-foreground/5 text-muted-foreground">{roleLabel[r]}</span>
                  <span className="inline-flex items-center gap-1 ml-auto text-muted-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground truncate">
                  Last active: {p.last_active_at ? relativeTime(p.last_active_at) : "—"}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;