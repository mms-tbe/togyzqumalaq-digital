import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Self-hosted PostgREST sometimes emits JWTs with an empty `role` claim, which causes
 * PostgreSQL to reject `SET ROLE ""` with: role "" does not exist.
 *
 * After verifying the user via `createServerClient().auth.getUser()`, use the service role
 * key for table access so PostgREST does not depend on JWT role switching.
 * Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
 *
 * `.env.local` (server-only):
 * - `SUPABASE_SERVICE_ROLE_KEY` — Dashboard → Settings → API → service_role
 * - `DEBUG_TOGYZ=1` — optional; enables `[togyz:...]` logs in `src/lib/logger.ts`
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** DB client: service role when configured, else session client (RLS + normal JWT). */
export async function getServerDb(): Promise<SupabaseClient> {
  return createServiceRoleClient() ?? (await createServerClient());
}
