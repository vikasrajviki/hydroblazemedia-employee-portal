import { supabase } from "@/integrations/supabase/client";

export type ActivityAction =
  | "task_created" | "task_completed" | "task_updated"
  | "document_uploaded" | "document_updated"
  | "announcement_posted"
  | "member_joined" | "member_role_changed";

export async function logActivity(input: {
  action: ActivityAction;
  entityType: "task" | "document" | "announcement" | "member";
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;
  let actorName: string | null = user.email ?? null;
  const { data: p } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle();
  if (p?.full_name) actorName = p.full_name;
  else if (p?.email) actorName = p.email;
  await supabase.from("activity_log").insert({
    actor_id: user.id,
    actor_name: actorName,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    summary: input.summary,
    metadata: (input.metadata ?? {}) as never,
  });
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}