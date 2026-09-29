import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.ZH_THER_CONFIG || {};
export const isConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
export const supabase = isConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" }
    })
  : null;

export async function getCurrentMembership() {
  if (!supabase) return { user: null, membership: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, membership: null };
  const { data: membership } = await supabase
    .from("members")
    .select("id,email,github_username,role,status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  return { user, membership };
}

export async function signInWithGitHub() {
  if (!supabase) throw new Error("尚未连接内容数据库");
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  return supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo } });
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  window.location.reload();
}
