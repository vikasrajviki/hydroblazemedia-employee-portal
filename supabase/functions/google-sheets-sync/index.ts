import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SHEETS_GATEWAY = 'https://connector-gateway.lovable.dev/google_sheets';
const SETTINGS_KEY = 'google_sheets_register';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

async function requireUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !anonKey) throw new Error('Backend auth is not configured');
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return { error: json({ error: 'Missing authorization token' }, 401) };
  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { error: json({ error: 'Invalid session' }, 401) };
  return { user: data.user };
}

function serviceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) throw new Error('Backend service is not configured');
  return createClient(supabaseUrl, serviceKey);
}

async function sheetsFetch(path: string, init: RequestInit = {}) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const sheetsKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
  if (!lovableKey || !sheetsKey) throw new Error('Google Sheets connector is not linked');
  const response = await fetch(`${SHEETS_GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': sheetsKey,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const details = await response.text();
    console.error(`Google Sheets gateway failed [${response.status}]: ${details}`);
    throw Object.assign(new Error(details || 'Google Sheets request failed'), { status: response.status, details });
  }
  return response;
}

async function getRegisterSpreadsheetId(userId: string) {
  const admin = serviceClient();
  const { data } = await admin.from('integration_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
  const existingId = (data?.value as { spreadsheetId?: string } | null)?.spreadsheetId;
  if (existingId) return existingId;

  const created = await sheetsFetch('/v4/spreadsheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: 'HydroBlaze Workspace Registers' },
      sheets: [
        { properties: { title: 'Tasks' } },
        { properties: { title: 'Documents' } },
        { properties: { title: 'Announcements' } },
        { properties: { title: 'Clients' } },
      ],
    }),
  });
  const body = await created.json();
  const spreadsheetId = body.spreadsheetId;
  if (!spreadsheetId) throw new Error('Google Sheets did not return a spreadsheet id');
  await admin.from('integration_settings').upsert({
    key: SETTINGS_KEY,
    value: { spreadsheetId, url: body.spreadsheetUrl ?? null },
    updated_by: userId,
  });
  return spreadsheetId as string;
}

const value = (input: unknown) => input == null ? '' : String(input);

function rowFor(type: string, payload: Record<string, unknown>) {
  const now = new Date().toISOString();
  if (type === 'task') {
    return { range: 'Tasks!A:J', values: [[
      now, value(payload.id), value(payload.title), value(payload.status), value(payload.priority),
      value(payload.assignee), value(payload.start_date), value(payload.due_date),
      value(payload.checklist), value(payload.updated_by),
    ]] };
  }
  if (type === 'document') {
    return { range: 'Documents!A:K', values: [[
      now, value(payload.id), value(payload.name), value(payload.folder), value(payload.client),
      value(payload.category), value(payload.version), value(payload.size_bytes),
      value(payload.google_drive_url), value(payload.uploaded_by), value(payload.action),
    ]] };
  }
  if (type === 'announcement') {
    return { range: 'Announcements!A:H', values: [[
      now, value(payload.id), value(payload.title), value(payload.category), value(payload.pinned),
      value(payload.scheduled_for), value(payload.created_by), value(payload.action),
    ]] };
  }
  if (type === 'client') {
    return { range: 'Clients!A:F', values: [[
      now, value(payload.name), value(payload.status), value(payload.owner), value(payload.notes), value(payload.source),
    ]] };
  }
  throw new Error('Unsupported sync type');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const body = await req.json().catch(() => null) as { type?: string; payload?: Record<string, unknown> } | null;
    if (!body?.type || !body.payload || typeof body.payload !== 'object') return json({ error: 'type and payload are required' }, 400);
    const { range, values } = rowFor(body.type, body.payload);
    const spreadsheetId = await getRegisterSpreadsheetId(auth.user.id);

    await sheetsFetch(`/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });

    return json({ ok: true, spreadsheetId });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : 500;
    const details = (error as { details?: string }).details ?? (error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'Google Sheets sync failed', details }, status);
  }
});
