import { useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { CheckSquare, Megaphone, FileText, AlertTriangle, Calendar, Pin, Eye, Activity, Plus, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/portal/lib/activity";

interface Task { id: string; title: string; status: string; priority: string; due_date: string | null; }
interface Announcement { id: string; title: string; body: string; created_at: string; pinned: boolean; }
interface Doc { id: string; name: string; folder: string; created_at: string; }
interface Act { id: string; action: string; actor_name: string | null; entity_type: string; summary: string; created_at: string; }

const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); };

const priorityBadge = (p: string) =>
  p === "high" ? "bg-blaze/15 text-blaze border-blaze/30"
  : p === "low" ? "bg-foreground/5 text-muted-foreground border-foreground/10"
  : "bg-hydro/15 text-hydro border-hydro/30";

const ACTION_META: Record<string, { label: string; icon: typeof CheckSquare; color: string }> = {
  task_created:        { label: "Task created",        icon: CheckSquare, color: "text-hydro" },
  task_completed:      { label: "Task completed",      icon: CheckSquare, color: "text-emerald-500" },
  task_updated:        { label: "Task updated",        icon: CheckSquare, color: "text-muted-foreground" },
  document_uploaded:   { label: "Document uploaded",   icon: FileText,    color: "text-hydro" },
  document_updated:    { label: "Document updated",    icon: FileText,    color: "text-muted-foreground" },
  announcement_posted: { label: "Announcement posted", icon: Megaphone,   color: "text-blaze" },
  member_joined:       { label: "Team member joined",  icon: Sparkles,    color: "text-blaze" },
  member_role_changed: { label: "Role changed",        icon: Sparkles,    color: "text-muted-foreground" },
};

const StatCard = ({ label, value, icon: Icon, tint }: { label: string; value: number; icon: typeof Calendar; tint: string }) => (
  <div className="p-5 rounded-xl border border-foreground/10 bg-card/60">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Icon className={`w-5 h-5 ${tint}`} />
    </div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

const Panel = ({ title, icon: Icon, href, children, action }: { title: string; icon: typeof Calendar; href: string; children: ReactNode; action?: ReactNode }) => (
  <section className="p-5 rounded-xl border border-foreground/10 bg-card/60">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold flex items-center gap-2"><Icon className="w-4 h-4 text-hydro" /> {title}</h2>
      {action ?? <Link to={href} className="text-xs text-hydro hover:underline">View all</Link>}
    </div>
    {children}
  </section>
);

const Empty = ({ line, cta }: { line: string; cta?: { to: string; label: string; icon?: typeof Plus } }) => (
  <div className="py-4 text-center">
    <p className="text-sm text-muted-foreground mb-3">{line}</p>
    {cta && (
      <Button asChild size="sm" variant="outline" className="gap-1.5">
        <Link to={cta.to}>{cta.icon && <cta.icon className="w-3.5 h-3.5" />} {cta.label}</Link>
      </Button>
    )}
  </div>
);

const Dashboard = () => {
  const { user, profile, canManage } = usePortalAuth();
  const [dueToday, setDueToday] = useState<Task[]>([]);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [awaiting, setAwaiting] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activity, setActivity] = useState<Act[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const t = today();
      const [d, o, r, a, dc, act] = await Promise.all([
        supabase.from("tasks").select("id,title,status,priority,due_date").eq("assignee_id", user.id).neq("status", "done").eq("due_date", t),
        supabase.from("tasks").select("id,title,status,priority,due_date").eq("assignee_id", user.id).neq("status", "done").lt("due_date", t),
        supabase.from("tasks").select("id,title,status,priority,due_date").eq("status", "review").order("updated_at", { ascending: false }).limit(6),
        supabase.from("announcements").select("id,title,body,created_at,pinned").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5),
        supabase.from("documents").select("id,name,folder,created_at").eq("is_current", true).order("created_at", { ascending: false }).limit(5),
        supabase.from("activity_log").select("id,action,actor_name,entity_type,summary,created_at").order("created_at", { ascending: false }).limit(8),
      ]);
      setDueToday((d.data as Task[]) ?? []);
      setOverdue((o.data as Task[]) ?? []);
      setAwaiting((r.data as Task[]) ?? []);
      setAnnouncements((a.data as Announcement[]) ?? []);
      setDocs((dc.data as Doc[]) ?? []);
      setActivity((act.data as Act[]) ?? []);
    })();
  }, [user]);

  const firstName = (profile?.full_name || user?.email || "").split(/[\s@]/)[0] || "there";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Welcome back, {firstName}</h1>
      <p className="text-muted-foreground mb-8">Here's what needs your attention today.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Due today"        value={dueToday.length}      icon={Calendar}       tint="text-hydro" />
        <StatCard label="Overdue"          value={overdue.length}       icon={AlertTriangle}  tint="text-blaze" />
        <StatCard label="Awaiting review"  value={awaiting.length}      icon={Eye}            tint="text-blaze" />
        <StatCard label="New this week"    value={activity.length}      icon={Activity}       tint="text-hydro" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Tasks due today" icon={CheckSquare} href="/portal/tasks">
          {dueToday.length === 0 ? (
            <Empty line="You're all caught up." cta={{ to: "/portal/tasks", label: "Open tasks", icon: CheckSquare }} />
          ) : (
            <ul className="space-y-2">{dueToday.map(t => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{t.title}</span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${priorityBadge(t.priority)}`}>{t.priority}</span>
              </li>))}
            </ul>
          )}
        </Panel>

        <Panel title="Overdue tasks" icon={AlertTriangle} href="/portal/tasks">
          {overdue.length === 0 ? (
            <Empty line="Nothing overdue. Nice." />
          ) : (
            <ul className="space-y-2">{overdue.map(t => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{t.title}</span>
                <span className="text-xs text-blaze">{t.due_date}</span>
              </li>))}
            </ul>
          )}
        </Panel>

        <Panel title="Awaiting review" icon={Eye} href="/portal/tasks">
          {awaiting.length === 0 ? (
            <Empty line="No work is waiting on a review." />
          ) : (
            <ul className="space-y-2">{awaiting.map(t => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{t.title}</span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border bg-blaze/15 text-blaze border-blaze/30">Review</span>
              </li>))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent announcements" icon={Megaphone} href="/portal/announcements">
          {announcements.length === 0 ? (
            <Empty
              line="No announcements yet."
              cta={canManage ? { to: "/portal/announcements", label: "Post one", icon: Plus } : undefined}
            />
          ) : (
            <ul className="space-y-3">{announcements.map(a => (
              <li key={a.id} className="text-sm">
                <div className="flex items-center gap-2 font-medium">{a.pinned && <Pin className="w-3 h-3 text-blaze" />}{a.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{a.body}</div>
              </li>))}
            </ul>
          )}
        </Panel>

        <Panel title="Recently uploaded documents" icon={FileText} href="/portal/documents">
          {docs.length === 0 ? (
            <Empty
              line="No documents shared yet."
              cta={canManage ? { to: "/portal/documents", label: "Upload", icon: Upload } : undefined}
            />
          ) : (
            <ul className="space-y-2">{docs.map(d => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{d.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-foreground/10 bg-foreground/5">{d.folder}</span>
              </li>))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity" icon={Activity} href="/portal">
          {activity.length === 0 ? (
            <Empty line="Activity from your team will show up here." />
          ) : (
            <ul className="space-y-3">{activity.map((ev) => {
              const meta = ACTION_META[ev.action] ?? { label: ev.action, icon: Activity, color: "text-muted-foreground" };
              const Icon = meta.icon;
              return (
                <li key={ev.id} className="flex items-start gap-3 text-sm">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">
                      <span className="font-medium">{ev.actor_name ?? "Someone"}</span>{" "}
                      <span className="text-muted-foreground">{ev.summary}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{relativeTime(ev.created_at)}</div>
                  </div>
                </li>
              );
            })}</ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;