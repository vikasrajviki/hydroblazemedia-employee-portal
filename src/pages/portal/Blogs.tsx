import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Star, Eye, Pencil, RotateCcw, Copy, Trash2 } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "draft" | "published" | "archived";
  category: string | null;
  featured: boolean;
  read_minutes: number;
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

const statusChip: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  archived: "bg-foreground/10 text-muted-foreground border-foreground/20",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

const Blogs = () => {
  const { canManage } = usePortalAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Blog[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("blogs").select("*").order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Blog[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((b) => b.category).filter(Boolean))) as string[],
    [items]
  );

  const filtered = items.filter((b) => {
    if (status !== "all" && b.status !== status) return false;
    if (category !== "all" && b.category !== category) return false;
    if (q && !`${b.title} ${b.excerpt ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalPublished = items.filter((b) => b.status === "published").length;

  const toggleFeatured = async (b: Blog) => {
    const { error } = await supabase.from("blogs").update({ featured: !b.featured }).eq("id", b.id);
    if (error) return toast.error(error.message);
    load();
  };
  const duplicate = async (b: Blog) => {
    const { data: full } = await supabase.from("blogs").select("*").eq("id", b.id).single();
    if (!full) return;
    const base = slugify(`${full.title}-copy`);
    const { error } = await supabase.from("blogs").insert({
      title: `${full.title} (copy)`,
      slug: `${base}-${Math.random().toString(36).slice(2, 6)}`,
      excerpt: full.excerpt,
      content: full.content,
      cover_image_url: full.cover_image_url,
      category: full.category,
      tags: full.tags,
      status: "draft",
      read_minutes: full.read_minutes,
    });
    if (error) return toast.error(error.message);
    toast.success("Duplicated as draft");
    load();
  };
  const setStatusOf = async (b: Blog, next: Blog["status"]) => {
    const patch: { status: Blog["status"]; published_at?: string } = { status: next };
    if (next === "published" && !b.published_at) patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("blogs").update(patch).eq("id", b.id);
    if (error) return toast.error(error.message);
    load();
  };
  const remove = async (b: Blog) => {
    if (!confirm(`Delete "${b.title}"? This can't be undone.`)) return;
    const { error } = await supabase.from("blogs").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Blogs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} total · {totalPublished} published
          </p>
        </div>
        {canManage && (
          <Button onClick={() => navigate("/portal/blogs/new")} className="rounded-full bg-hydro hover:bg-hydro/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> New blog
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl border border-foreground/10 bg-card/40 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title or excerpt…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-background/60 border-foreground/10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-48 bg-background/60 border-foreground/10"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-48 bg-background/60 border-foreground/10"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-foreground/10 rounded-2xl">
          <p className="text-muted-foreground text-sm">No blogs match your filters.</p>
          {canManage && (
            <Button onClick={() => navigate("/portal/blogs/new")} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Create your first blog
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => (
            <li key={b.id} className="flex items-center gap-3 p-4 rounded-2xl border border-foreground/10 bg-card/40 hover:bg-card/60 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/portal/blogs/${b.id}/edit`} className="font-semibold truncate hover:text-hydro">
                    {b.title}
                  </Link>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusChip[b.status]}`}>{b.status}</span>
                  {b.featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  /{b.slug} · {b.read_minutes} min read · updated {new Date(b.updated_at).toLocaleDateString()}
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" title="Toggle featured" onClick={() => toggleFeatured(b)}>
                    <Star className={`w-4 h-4 ${b.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                  </Button>
                  {b.status !== "published" ? (
                    <Button size="icon" variant="ghost" title="Publish" onClick={() => setStatusOf(b, "published")}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" title="Move to draft" onClick={() => setStatusOf(b, "draft")}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" title="Edit" onClick={() => navigate(`/portal/blogs/${b.id}/edit`)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Duplicate" onClick={() => duplicate(b)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(b)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Blogs;