import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin/anon client that bypasses user JWT (which has empty role on this instance).
 * Uses anon key directly — RLS policies are USING(true) so this is safe for MVP.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
