import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Megaphone, Search, UserCircle2, CheckSquare } from "lucide-react";

type Result = { id: string; title: string; subtitle: string; route: string; kind: "Task" | "Announcement" | "Document" | "Person" };

const iconFor = {
  Task: CheckSquare,
  Announcement: Megaphone,
  Document: FileText,
  Person: UserCircle2,
};

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [tasks, announcements, docs, profiles] = await Promise.all([
        supabase.from("tasks").select("id,title,status,priority").limit(30),
        supabase.from("announcements").select("id,title,category").limit(30),
        supabase.from("documents").select("id,name,folder,client").eq("is_current", true).limit(30),
        supabase.from("profiles").select("id,email,full_name,job_title,department").limit(30),
      ]);

      setResults([
        ...((tasks.data ?? []) as any[]).map((task) => ({
          id: `task-${task.id}`,
          title: task.title,
          subtitle: `${task.status?.replace("_", " ") ?? "task"} · ${task.priority ?? "priority"}`,
          route: "/portal/tasks",
          kind: "Task" as const,
        })),
        ...((announcements.data ?? []) as any[]).map((item) => ({
          id: `announcement-${item.id}`,
          title: item.title,
          subtitle: item.category ?? "Announcement",
          route: "/portal/announcements",
          kind: "Announcement" as const,
        })),
        ...((docs.data ?? []) as any[]).map((doc) => ({
          id: `document-${doc.id}`,
          title: doc.name,
          subtitle: [doc.folder, doc.client].filter(Boolean).join(" · ") || "Document",
          route: "/portal/documents",
          kind: "Document" as const,
        })),
        ...((profiles.data ?? []) as any[]).map((profile) => ({
          id: `profile-${profile.id}`,
          title: profile.full_name || profile.email,
          subtitle: [profile.job_title, profile.department].filter(Boolean).join(" · ") || profile.email,
          route: "/portal/team",
          kind: "Person" as const,
        })),
      ]);
    })();
  }, [open]);

  const go = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <>
      <Button variant="outline" className="hidden min-w-64 justify-start gap-2 text-muted-foreground md:flex" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" /> Search workspace
        <span className="ml-auto rounded border border-foreground/10 px-1.5 py-0.5 text-[10px]">⌘K</span>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Search workspace">
        <Search className="h-4 w-4" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks, documents, announcements, people…" />
        <CommandList>
          <CommandEmpty>No matching results.</CommandEmpty>
          <CommandGroup heading="Workspace">
            {results.map((result) => {
              const Icon = iconFor[result.kind];
              return (
                <CommandItem key={result.id} value={`${result.kind} ${result.title} ${result.subtitle}`} onSelect={() => go(result.route)}>
                  <Icon className="mr-2 h-4 w-4 text-hydro" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{result.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{result.kind} · {result.subtitle}</p>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
