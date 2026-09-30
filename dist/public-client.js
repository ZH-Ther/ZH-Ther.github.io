const config = window.ZH_THER_CONFIG || {};
const publishableKey = config.supabasePublishableKey || config.supabaseAnonKey || "";

export const isPublicConfigured = Boolean(config.supabaseUrl && publishableKey);

function projectRef() {
  try { return new URL(config.supabaseUrl).hostname.split(".")[0]; }
  catch { return ""; }
}

function storedSession() {
  const ref = projectRef();
  if (!ref) return null;
  try {
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function accessToken() {
  const session = storedSession();
  const token = session?.access_token || session?.currentSession?.access_token || "";
  if (!token) return "";
  try {
    const payload = decodeToken(token);
    return payload?.exp && payload.exp <= Math.floor(Date.now() / 1000) ? "" : token;
  } catch { return ""; }
}

function decodeToken(token) {
  const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function tokenPayload() {
  try { return accessToken() ? decodeToken(accessToken()) : null; }
  catch { return null; }
}

export async function selectRows(table, query = "select=*") {
  if (!isPublicConfigured) throw new Error("内容数据库尚未配置");
  const token = accessToken() || publishableKey;
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`${table}: ${response.status}`);
  return response.json();
}

export async function currentPublicMembership() {
  const payload = tokenPayload();
  if (!payload?.sub) return { user: null, membership: null };
  try {
    const rows = await selectRows("members", `select=id,email,github_username,role,status&user_id=eq.${encodeURIComponent(payload.sub)}&status=eq.active&limit=1`);
    return { user: { id: payload.sub, email: payload.email }, membership: rows[0] || null };
  } catch {
    return { user: { id: payload.sub, email: payload.email }, membership: null };
  }
}
