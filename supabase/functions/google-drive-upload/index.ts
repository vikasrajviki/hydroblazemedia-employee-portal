import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const DRIVE_GATEWAY = 'https://connector-gateway.lovable.dev/google_drive';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

type DriveFile = { id: string; name: string; webViewLink?: string; webContentLink?: string; mimeType?: string; size?: string };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

async function requireManager(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) throw new Error('Backend auth is not configured');

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return { error: json({ error: 'Missing authorization token' }, 401) };

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) return { error: json({ error: 'Invalid session' }, 401) };

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: roles, error: roleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .in('role', ['admin', 'manager']);
  if (roleError) throw roleError;
  if (!roles?.length) return { error: json({ error: 'Only admins and managers can upload Drive documents' }, 403) };
  return { user: data.user };
}

async function driveFetch(path: string, init: RequestInit = {}) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const driveKey = Deno.env.get('GOOGLE_DRIVE_API_KEY');
  if (!lovableKey || !driveKey) throw new Error('Google Drive connector is not linked');

  const response = await fetch(`${DRIVE_GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': driveKey,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    console.error(`Google Drive gateway failed [${response.status}]: ${details}`);
    throw Object.assign(new Error(details || 'Google Drive request failed'), { status: response.status, details });
  }
  return response;
}

const escapeQueryValue = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

async function findOrCreateFolder(name: string, parentId?: string): Promise<{ id: string; name: string }> {
  const queryParts = [
    `name='${escapeQueryValue(name)}'`,
    `mimeType='${FOLDER_MIME}'`,
    'trashed=false',
  ];
  if (parentId) queryParts.push(`'${parentId}' in parents`);

  const params = new URLSearchParams({
    q: queryParts.join(' and '),
    fields: 'files(id,name)',
    pageSize: '1',
  });
  const existing = await driveFetch(`/drive/v3/files?${params.toString()}`);
  const existingBody = await existing.json();
  if (existingBody.files?.[0]) return existingBody.files[0];

  const created = await driveFetch('/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  return created.json();
}

async function destinationFolder(folder: string, client: string | null, category: string | null) {
  const root = await findOrCreateFolder('HydroBlaze Media');
  if (folder === 'Clients') {
    const clients = await findOrCreateFolder('Clients', root.id);
    const clientFolder = await findOrCreateFolder(client?.trim() || 'Unassigned Client', clients.id);
    return category?.trim() ? findOrCreateFolder(category.trim(), clientFolder.id) : clientFolder;
  }

  const internal = await findOrCreateFolder('Internal', root.id);
  return findOrCreateFolder(folder || 'General', internal.id);
}

function multipartBody(metadata: Record<string, unknown>, file: File, fileBytes: Uint8Array, boundary: string) {
  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
  );
  const tail = encoder.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(head.length + fileBytes.length + tail.length);
  body.set(head, 0);
  body.set(fileBytes, head.length);
  body.set(tail, head.length + fileBytes.length);
  return body;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = await requireManager(req);
    if ('error' in auth) return auth.error;

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return json({ error: 'A file is required' }, 400);
    if (file.size > 50 * 1024 * 1024) return json({ error: 'File must be 50MB or smaller' }, 400);

    const folder = String(form.get('folder') || 'General').slice(0, 80);
    const client = form.get('client') ? String(form.get('client')).slice(0, 120) : null;
    const category = form.get('category') ? String(form.get('category')).slice(0, 120) : null;
    const requestedName = String(form.get('name') || file.name).trim().slice(0, 160) || file.name;

    const parent = await destinationFolder(folder, client, category);
    const boundary = `lovable-${crypto.randomUUID()}`;
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const metadata = { name: requestedName, parents: [parent.id], mimeType: file.type || 'application/octet-stream' };

    const upload = await driveFetch('/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,mimeType,size', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: multipartBody(metadata, file, fileBytes, boundary),
    });
    const uploaded = await upload.json() as DriveFile;

    return json({
      file: {
        id: uploaded.id,
        name: uploaded.name,
        mimeType: uploaded.mimeType || file.type || null,
        size: uploaded.size ? Number(uploaded.size) : file.size,
        webViewLink: uploaded.webViewLink ?? null,
        webContentLink: uploaded.webContentLink ?? null,
        parentFolderId: parent.id,
      },
    });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : 500;
    const details = (error as { details?: string }).details ?? (error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'Google Drive upload failed', details }, status);
  }
});
