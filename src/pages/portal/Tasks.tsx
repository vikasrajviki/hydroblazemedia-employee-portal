import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Paperclip, MessageSquare, Download, Trash2, Send, CalendarDays, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { logActivity } from "@/portal/lib/activity";
import { syncWorkspaceSheet } from "@/portal/lib/google-sync";

interface Task {
  id: string; title: string; description: string | null;
  status: string; priority: string; start_date: string | null; due_date: string | null;
  assignee_id: string | null; created_by: string | null;
  checklist_total: number; checklist_done: number; updated_at?: string;
}
interface Profile { id: string; email: string; full_name: string | null; }
interface Attachment { id: string; task_id: string; storage_path: string; name: string; size_bytes: number | null; uploaded_by: string | null; created_at: string; }
interface Comment { id: string; task_id: string; created_by: string | null; body: string; created_at: string; }
interface ChecklistItem { id: string; task_id: string; title: string; completed: boolean; created_by: string | null; created_at: string; }

const STATUSES = [
  { value: "todo", label: "To Do", icon: Clock3 },
  { value: "in_progress", label: "In Progress", icon: CalendarDays },
  { value: "review", label: "Review", icon: ListChecks },
  { value: "done", label: "Completed", icon: CheckCircle2 },
];
const PRIORITIES = ["low", "medium", "high"];

const Tasks = () => {
  const { user, canManage, isAdmin } = usePortalAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", start_date: "", due_date: "", assignee_id: "" });
  const [detail, setDetail] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newComment, setNewComment] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks((data as Task[]) ?? []);
    const { data: p } = await supabase.from("profiles").select("id,email,full_name");
    setProfiles((p as Profile[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const nameFor = (id: string | null) => {
    if (!id) return "Unassigned";
    const p = profiles.find((x) => x.id === id);
    return p?.full_name || p?.email || (id === user?.id ? "You" : "—");
  };

  const board = useMemo(() => STATUSES.map((status) => ({
    ...status,
    tasks: tasks.filter((task) => task.status === status.value),
  })), [tasks]);

  const notifyAssignee = async (task: { id: string; title: string }, assigneeId: string | null, type: "task_assigned" | "task_updated" | "review_requested") => {
    if (!assigneeId || assigneeId === user?.id) return;
    await supabase.from("notifications").insert({
      user_id: assigneeId,
      type,
      title: type === "review_requested" ? "Task ready for review" : type === "task_assigned" ? "New task assigned" : "Task updated",
      body: task.title,
      entity_type: "task",
      entity_id: task.id,
    });
  };

  const create = async () => {
    if (!form.title) return toast.error("Title required");
    const { data, error } = await supabase.from("tasks").insert({
      title: form.title, description: form.description || null,
      priority: form.priority, start_date: form.start_date || null, due_date: form.due_date || null,
      assignee_id: form.assignee_id || null, created_by: user!.id,
    }).select("id,title,priority,status,start_date,due_date,assignee_id").single();
    if (error) return toast.error(error.message);
    if (data) {
      await Promise.all([
        logActivity({ action: "task_created", entityType: "task", entityId: data.id, summary: `Created task “${data.title}”` }),
        notifyAssignee(data, data.assignee_id, "task_assigned"),
        syncWorkspaceSheet("task", { ...data, assignee: nameFor(data.assignee_id), updated_by: user?.email, checklist: "0/0" }),
      ]);
    }
    toast.success("Task created");
    setOpen(false);
    setForm({ title: "", description: "", priority: "medium", start_date: "", due_date: "", assignee_id: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id).select("id,title,priority,status,start_date,due_date,assignee_id,checklist_total,checklist_done").single();
    if (error) return toast.error(error.message);
    if (data) {
      await Promise.all([
        status === "done"
          ? logActivity({ action: "task_completed", entityType: "task", entityId: data.id, summary: `Completed task “${data.title}”` })
          : logActivity({ action: "task_updated", entityType: "task", entityId: data.id, summary: `Moved task “${data.title}” to ${status.replace("_", " ")}` }),
        notifyAssignee(data, data.assignee_id, status === "review" ? "review_requested" : "task_updated"),
        syncWorkspaceSheet("task", { ...data, assignee: nameFor(data.assignee_id), updated_by: user?.email, checklist: `${data.checklist_done}/${data.checklist_total}` }),
      ]);
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const openDetail = async (t: Task) => {
    setDetail(t);
    const [a, c, cl] = await Promise.all([
      supabase.from("task_attachments").select("*").eq("task_id", t.id).order("created_at", { ascending: false }),
      supabase.from("task_comments").select("*").eq("task_id", t.id).order("created_at", { ascending: true }),
      supabase.from("task_checklist_items").select("*").eq("task_id", t.id).order("created_at", { ascending: true }),
    ]);
    setAttachments((a.data as Attachment[]) ?? []);
    setComments((c.data as Comment[]) ?? []);
    setChecklist((cl.data as ChecklistItem[]) ?? []);
  };

  const refreshChecklistCounters = async (taskId: string, items: ChecklistItem[]) => {
    const total = items.length;
    const done = items.filter((item) => item.completed).length;
    await supabase.from("tasks").update({ checklist_total: total, checklist_done: done }).eq("id", taskId);
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, checklist_total: total, checklist_done: done } : task));
    setDetail((current) => current?.id === taskId ? { ...current, checklist_total: total, checklist_done: done } : current);
  };

  const addChecklistItem = async () => {
    if (!detail || !newChecklistItem.trim()) return;
    const { data, error } = await supabase.from("task_checklist_items").insert({
      task_id: detail.id,
      title: newChecklistItem.trim(),
      created_by: user!.id,
    }).select("*").single();
    if (error) return toast.error(error.message);
    const next = [...checklist, data as ChecklistItem];
    setChecklist(next);
    setNewChecklistItem("");
    await refreshChecklistCounters(detail.id, next);
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    const nextCompleted = !item.completed;
    const { error } = await supabase.from("task_checklist_items").update({ completed: nextCompleted }).eq("id", item.id);
    if (error) return toast.error(error.message);
    const next = checklist.map((entry) => entry.id === item.id ? { ...entry, completed: nextCompleted } : entry);
    setChecklist(next);
    await refreshChecklistCounters(item.task_id, next);
  };

  const deleteChecklistItem = async (item: ChecklistItem) => {
    const { error } = await supabase.from("task_checklist_items").delete().eq("id", item.id);
    if (error) return toast.error(error.message);
    const next = checklist.filter((entry) => entry.id !== item.id);
    setChecklist(next);
    await refreshChecklistCounters(item.task_id, next);
  };

  const uploadAttachment = async () => {
    if (!detail) return;
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Choose a file");
    const path = `task-attachments/${detail.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
    if (upErr) return toast.error(upErr.message);
    const { error } = await supabase.from("task_attachments").insert({
      task_id: detail.id, storage_path: path, name: file.name,
      mime_type: file.type, size_bytes: file.size, uploaded_by: user!.id,
    });
    if (error) return toast.error(error.message);
    if (fileRef.current) fileRef.current.value = "";
    openDetail(detail);
  };

  const downloadAttachment = async (a: Attachment) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(a.storage_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const deleteAttachment = async (a: Attachment) => {
    await supabase.storage.from("documents").remove([a.storage_path]);
    await supabase.from("task_attachments").delete().eq("id", a.id);
    if (detail) openDetail(detail);
  };

  const postComment = async () => {
    if (!detail || !newComment.trim()) return;
    const { error } = await supabase.from("task_comments").insert({
      task_id: detail.id, created_by: user!.id, body: newComment.trim(),
    });
    if (error) return toast.error(error.message);
    await notifyAssignee(detail, detail.assignee_id, "task_updated");
    setNewComment("");
    openDetail(detail);
  };

  const statusColor = (s: string) =>
    s === "done" ? "bg-hydro/15 text-hydro border-hydro/30"
    : s === "review" ? "bg-blaze/15 text-blaze border-blaze/30"
    : s === "in_progress" ? "bg-foreground/10 border-foreground/20"
    : "bg-foreground/5 text-muted-foreground border-foreground/10";

  const priorityColor = (p: string) =>
    p === "high" ? "bg-blaze/15 text-blaze border-blaze/30" :
    p === "low" ? "bg-foreground/5 text-muted-foreground border-foreground/10" :
    "bg-hydro/15 text-hydro border-hydro/30";

  const TaskCard = ({ task }: { task: Task }) => {
    const overdue = task.due_date && new Date(task.due_date) < new Date(new Date().toDateString()) && task.status !== "done";
    const progress = task.checklist_total > 0 ? Math.round((task.checklist_done / task.checklist_total) * 100) : 0;
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={() => openDetail(task)}
        onKeyDown={(event) => event.key === "Enter" && openDetail(task)}
        className="group rounded-xl border border-foreground/10 bg-card/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-hydro/35 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hydro/50"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-snug group-hover:text-hydro transition-colors">{task.title}</h3>
          {isAdmin && <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-7 w-7" onClick={(event) => { event.stopPropagation(); remove(task.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>}
        </div>
        {task.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${priorityColor(task.priority)}`}>{task.priority}</span>
          {task.due_date && <span className={`text-[10px] px-2 py-0.5 rounded-full border ${overdue ? "border-blaze/30 bg-blaze/10 text-blaze" : "border-foreground/10 bg-foreground/5 text-muted-foreground"}`}>{overdue ? "Overdue" : `Due ${task.due_date}`}</span>}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{nameFor(task.assignee_id)}</span>
            <span>{task.checklist_done}/{task.checklist_total}</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-foreground/10" />
        </div>
        <Select value={task.status} onValueChange={(value) => updateStatus(task.id, value)}>
          <SelectTrigger className="mt-3 h-8 w-full text-xs" onClick={(event) => event.stopPropagation()}><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent>
        </Select>
      </article>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">{isAdmin ? "All team tasks." : canManage ? "Team tasks you manage." : "Tasks assigned to you."}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Assign to</Label>
                  <Select value={form.assignee_id} onValueChange={(v) => setForm({ ...form, assignee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={create} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {tasks.length === 0 && <p className="text-muted-foreground text-sm xl:col-span-4">No tasks yet.</p>}
        {board.map((column) => {
          const Icon = column.icon;
          return (
            <section key={column.value} className="min-h-72 rounded-2xl border border-foreground/10 bg-foreground/[0.025] p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-hydro" /> {column.label}</h2>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${statusColor(column.value)}`}>{column.tasks.length}</span>
              </div>
              <div className="space-y-3">
                {column.tasks.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            </section>
          );
        })}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.title}</DialogTitle></DialogHeader>
              {detail.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.description}</p>}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`uppercase px-2 py-0.5 rounded-full border ${priorityColor(detail.priority)}`}>{detail.priority}</span>
                <span className={`uppercase px-2 py-0.5 rounded-full border ${statusColor(detail.status)}`}>{detail.status.replace("_", " ")}</span>
                {detail.start_date && <span className="text-muted-foreground">Starts {detail.start_date}</span>}
                {detail.due_date && <span className="text-muted-foreground">Due {detail.due_date}</span>}
              </div>

              <section className="pt-4 border-t border-foreground/10">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><ListChecks className="w-4 h-4" /> Checklist</h4>
                <div className="space-y-2 mb-3">
                  {checklist.length === 0 && <p className="text-xs text-muted-foreground">No checklist items yet.</p>}
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-lg border border-foreground/10 p-2 text-sm">
                      <Checkbox checked={item.completed} onCheckedChange={() => toggleChecklistItem(item)} />
                      <span className={`flex-1 ${item.completed ? "text-muted-foreground line-through" : ""}`}>{item.title}</span>
                      {(item.created_by === user?.id || canManage) && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteChecklistItem(item)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newChecklistItem} onChange={(event) => setNewChecklistItem(event.target.value)} placeholder="Add checklist item" />
                  <Button onClick={addChecklistItem} variant="outline"><Plus className="w-4 h-4" /></Button>
                </div>
              </section>

              <section className="pt-4 border-t border-foreground/10">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><Paperclip className="w-4 h-4" /> Attachments</h4>
                <div className="space-y-2 mb-3">
                  {attachments.length === 0 && <p className="text-xs text-muted-foreground">No attachments.</p>}
                  {attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg border border-foreground/10 text-sm">
                      <span className="flex-1 truncate">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.size_bytes ? `${(a.size_bytes/1024).toFixed(1)} KB` : ""}</span>
                      <Button variant="ghost" size="icon" onClick={() => downloadAttachment(a)}><Download className="w-4 h-4" /></Button>
                      {(a.uploaded_by === user?.id || isAdmin) && (
                        <Button variant="ghost" size="icon" onClick={() => deleteAttachment(a)}><Trash2 className="w-4 h-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input type="file" ref={fileRef} />
                  <Button onClick={uploadAttachment} variant="outline"><Paperclip className="w-4 h-4 mr-1" />Attach</Button>
                </div>
              </section>

              <section className="pt-4 border-t border-foreground/10">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4" /> Comments</h4>
                <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                  {comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
                  {comments.map((c) => (
                    <div key={c.id} className="text-sm p-3 rounded-lg bg-foreground/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">{nameFor(c.created_by)}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment…" />
                  <Button onClick={postComment}><Send className="w-4 h-4" /></Button>
                </div>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;