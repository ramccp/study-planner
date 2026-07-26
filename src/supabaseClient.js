import { createClient } from "@supabase/supabase-js";

export const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
export const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export function makeSupabaseClient(url = envSupabaseUrl, key = envSupabaseAnonKey) {
  if (!url || !key) return null;
  return createClient(url, key);
}
