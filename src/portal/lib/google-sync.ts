import { supabase } from "@/integrations/supabase/client";

type SyncKind = "task" | "document" | "announcement" | "client";

export async function syncWorkspaceSheet(type: SyncKind, payload: Record<string, unknown>) {
  try {
    const { error } = await supabase.functions.invoke("google-sheets-sync", {
      body: { type, payload },
    });
    if (error) console.warn("Workspace sheet sync skipped:", error.message);
  } catch (error) {
    console.warn("Workspace sheet sync skipped:", error);
  }
}
