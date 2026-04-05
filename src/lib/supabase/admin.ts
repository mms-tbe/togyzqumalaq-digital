import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client with anon key only (no user session). Do not use for tables whose RLS is
 * `TO authenticated` — use `@/lib/supabase/server` `createClient()` so the JWT is sent.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
