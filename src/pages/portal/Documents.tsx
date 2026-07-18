import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Download, Trash2, FileText, History, FolderOpen, ExternalLink, Cloud } from "lucide-react";
import { logActivity } from "@/portal/lib/activity";
import { syncWorkspaceSheet } from "@/portal/lib/google-sync";

interface Doc {
  id: string; name: string; description: string | null; storage_path: string | null;
  size_bytes: number | null; created_at: string;
  folder: string; version: number; parent_id: string | null; is_current: boolean;
  client: string | null; category: string | null;
  google_drive_file_id: string | null; google_drive_url: string | null; google_drive_download_url: string | null;
}

interface DriveUploadResponse {
  file: {
    id: string;
    name: string;
    mimeType: string | null;
    size: number | null;
    webViewLink: string | null;
    webContentLink: string | null;
  };
}

const FOLDERS = ["SOPs", "Contracts", "Brand Assets", "HR", "Clients", "General"];
const CLIENT_CATEGORIES = ["Strategy", "Creative", "Reports", "Contracts", "Assets", "General"];

const Documents = () => {
  const { user, canManage, isAdmin } = usePortalAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState("SOPs");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("General");
  const [activeFolder, setActiveFolder] = useState<string>("SOPs");
  const [busy, setBusy] = useState(false);
  const [historyOf, setHistoryOf] = useState<Doc | null>(null);
  const [versions, setVersions] = useState<Doc[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const versionRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("documents").select("*").eq("is_current", true).order("created_at", { ascending: false });
    setDocs((data as Doc[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const uploadToDrive = async (file: File, displayName: string, targetFolder: string, targetClient: string, targetCategory: string) => {
    const body = new FormData();
    body.append("file", file);
    body.append("name", displayName || file.name);
    body.append("folder", targetFolder);
    if (targetClient.trim()) body.append("client", targetClient.trim());
    if (targetCategory.trim()) body.append("category", targetCategory.trim());
    const { data, error } = await supabase.functions.invoke("google-drive-upload", { body });
    if (error) throw error;
    return data as DriveUploadResponse;
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Choose a file");
    if (folder === "Clients" && !client.trim()) return toast.error("Client name is required for client documents");
    setBusy(true);
    let drive: DriveUploadResponse;
    try {
      drive = await uploadToDrive(file, name || file.name, folder, client, category);
    } catch (error) {
      setBusy(false);
      return toast.error(error instanceof Error ? error.message : "Google Drive upload failed");
    }
    const { data: inserted, error: insErr } = await supabase.from("documents").insert({
      name: name || file.name, description: description || null,
      storage_path: null, mime_type: drive.file.mimeType ?? file.type, size_bytes: drive.file.size ?? file.size,
      uploaded_by: user!.id, folder, client: folder === "Clients" ? client.trim() : null, category,
      google_drive_file_id: drive.file.id, google_drive_url: drive.file.webViewLink, google_drive_download_url: drive.file.webContentLink,
      version: 1, is_current: true,
    }).select("id,name,folder").single();
    setBusy(false);
    if (insErr) return toast.error(insErr.message);
    if (inserted) await Promise.all([
      logActivity({ action: "document_uploaded", entityType: "document", entityId: inserted.id, summary: `Uploaded “${inserted.name}” to ${inserted.folder}` }),
      syncWorkspaceSheet("document", { id: inserted.id, name: inserted.name, folder: inserted.folder, client, category, version: 1, size_bytes: drive.file.size ?? file.size, google_drive_url: drive.file.webViewLink, uploaded_by: user?.email, action: "uploaded" }),
    ]);
    toast.success("Uploaded to Google Drive");
    setName(""); setDescription(""); setClient(""); setCategory("General");
    if (fileRef.current) fileRef.current.value = "";
    load();
  };

  const uploadNewVersion = async (parent: Doc) => {
    const file = versionRef.current?.files?.[0];
    if (!file) return toast.error("Choose a file");
    setBusy(true);
    let drive: DriveUploadResponse;
    try {
      drive = await uploadToDrive(file, parent.name, parent.folder, parent.client ?? "", parent.category ?? "General");
    } catch (error) {
      setBusy(false);
      return toast.error(error instanceof Error ? error.message : "Google Drive upload failed");
    }
    // Mark parent chain as not current
    const rootId = parent.parent_id ?? parent.id;
    await supabase.from("documents").update({ is_current: false }).or(`id.eq.${rootId},parent_id.eq.${rootId}`);
    const { data: inserted, error: insErr } = await supabase.from("documents").insert({
      name: parent.name, description: parent.description,
      storage_path: null, mime_type: drive.file.mimeType ?? file.type, size_bytes: drive.file.size ?? file.size,
      uploaded_by: user!.id, folder: parent.folder, client: parent.client, category: parent.category,
      google_drive_file_id: drive.file.id, google_drive_url: drive.file.webViewLink, google_drive_download_url: drive.file.webContentLink,
      version: parent.version + 1, parent_id: rootId, is_current: true,
    }).select("id,name,folder,version").single();
    setBusy(false);
    if (insErr) return toast.error(insErr.message);
    if (inserted) await Promise.all([
      logActivity({ action: "document_updated", entityType: "document", entityId: inserted.id, summary: `Uploaded v${inserted.version} of “${inserted.name}”` }),
      syncWorkspaceSheet("document", { id: inserted.id, name: inserted.name, folder: inserted.folder, client: parent.client, category: parent.category, version: inserted.version, size_bytes: drive.file.size ?? file.size, google_drive_url: drive.file.webViewLink, uploaded_by: user?.email, action: "new_version" }),
    ]);
    toast.success("New version uploaded");
    if (versionRef.current) versionRef.current.value = "";
    setHistoryOf(null);
    load();
  };

  const openHistory = async (d: Doc) => {
    setHistoryOf(d);
    const rootId = d.parent_id ?? d.id;
    const { data } = await supabase.from("documents").select("*")
      .or(`id.eq.${rootId},parent_id.eq.${rootId}`)
      .order("version", { ascending: false });
    setVersions((data as Doc[]) ?? []);
  };

  const download = async (d: Doc) => {
    if (d.google_drive_download_url || d.google_drive_url) {
      window.open(d.google_drive_download_url || d.google_drive_url!, "_blank");
      return;
    }
    if (!d.storage_path) return toast.error("No file link is available for this document");
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(d.storage_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (d: Doc) => {
    if (!confirm("Delete this document (and all its versions)?")) return;
    const rootId = d.parent_id ?? d.id;
    const { data: all } = await supabase.from("documents").select("id,storage_path")
      .or(`id.eq.${rootId},parent_id.eq.${rootId}`);
    const paths = (all ?? []).map((x: any) => x.storage_path).filter(Boolean);
    if (paths.length) await supabase.storage.from("documents").remove(paths);
    const { error } = await supabase.from("documents").delete().or(`id.eq.${rootId},parent_id.eq.${rootId}`);
    if (error) return toast.error(error.message);
    load();
  };

  const filtered = docs.filter((d) => d.folder === activeFolder);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground text-sm">Shared company files, organized in Google Drive.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FOLDERS.map((f) => {
          const count = docs.filter((d) => d.folder === f).length;
          const active = f === activeFolder;
          return (
            <button key={f} onClick={() => setActiveFolder(f)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active ? "bg-hydro/15 text-hydro border-hydro/40" : "bg-card/60 text-muted-foreground border-foreground/10 hover:text-foreground"
              }`}>
              <FolderOpen className="w-3.5 h-3.5" />{f}
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {canManage && (
        <form onSubmit={upload} className="p-4 rounded-xl border border-foreground/10 bg-card/60 mb-6 grid gap-3 md:grid-cols-6">
          <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Auto from file" /></div>
          <div className="md:col-span-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div>
            <Label>Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FOLDERS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CLIENT_CATEGORIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>File</Label><Input type="file" ref={fileRef} required /></div>
          {folder === "Clients" && <div className="md:col-span-2"><Label>Client</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name" /></div>}
          <div className="md:col-span-6 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5" /> Files are stored under HydroBlaze Media / {folder === "Clients" ? "Clients / Client" : `Internal / ${folder}`}</p>
            <Button type="submit" disabled={busy}><Upload className="w-4 h-4 mr-2" />{busy ? "Uploading…" : "Upload to Drive"}</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-muted-foreground text-sm">No documents in {activeFolder} yet.</p>}
        {filtered.map((d) => (
          <div key={d.id} className="p-4 rounded-xl border border-foreground/10 bg-card/60 flex items-center gap-4">
            <FileText className="w-5 h-5 text-hydro shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate flex items-center gap-2">
                {d.name}
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-foreground/10 bg-foreground/5">v{d.version}</span>
              </div>
              {d.description && <div className="text-xs text-muted-foreground">{d.description}</div>}
              <div className="text-xs text-muted-foreground">
                {[d.client, d.category, d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : "", new Date(d.created_at).toLocaleDateString()].filter(Boolean).join(" · ")}
              </div>
            </div>
            {d.google_drive_url && <Button variant="ghost" size="icon" onClick={() => window.open(d.google_drive_url!, "_blank")} title="Open in Google Drive"><ExternalLink className="w-4 h-4" /></Button>}
            <Button variant="ghost" size="icon" onClick={() => download(d)}><Download className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openHistory(d)} title="Version history"><History className="w-4 h-4" /></Button>
            {isAdmin && <Button variant="ghost" size="icon" onClick={() => remove(d)}><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>

      <Dialog open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Version history — {historyOf?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg border border-foreground/10">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-foreground/5">v{v.version}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</div>
                </div>
                {v.is_current && <span className="text-[10px] text-hydro">current</span>}
                {v.google_drive_url && <Button variant="ghost" size="icon" onClick={() => window.open(v.google_drive_url!, "_blank")}><ExternalLink className="w-4 h-4" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => download(v)}><Download className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
          {canManage && historyOf && (
            <div className="pt-4 border-t border-foreground/10">
              <Label>Upload new version</Label>
              <div className="flex gap-2 mt-2">
                <Input type="file" ref={versionRef} />
                <Button onClick={() => uploadNewVersion(historyOf)} disabled={busy}>Upload</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;