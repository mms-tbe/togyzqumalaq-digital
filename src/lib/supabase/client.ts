import { createBrowserClient } from "@supabase/ssr";
import { looksLikeSupabaseJwtKey } from "@/lib/supabase/jwt";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (process.env.NODE_ENV === "development" && !looksLikeSupabaseJwtKey(anon)) {
    console.warn(
      "[togyz] NEXT_PUBLIC_SUPABASE_ANON_KEY must be the full anon JWT from Supabase API settings (three segments separated by dots)."
    );
  }
  return createBrowserClient(url!, anon!);
}
