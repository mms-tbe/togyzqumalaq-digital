import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { looksLikeSupabaseJwtKey, normalizeSupabaseKey } from "@/lib/supabase/jwt";

/**
 * Пароль PostgreSQL **не нужен** для API.
 * Если нет `DATABASE_URL`, добавь **`SUPABASE_SERVICE_ROLE_KEY`** — длинный JWT **service_role**
 * с той же страницы, что и anon: Project Settings → API (Reveal).
 * Он обходит сломанный `role` в пользовательском JWT при запросах к PostgREST.
 * Только сервер, не `NEXT_PUBLIC_*`.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = normalizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;
  if (!looksLikeSupabaseJwtKey(key)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[togyz] SUPABASE_SERVICE_ROLE_KEY: ожидается JWT с двумя точками (service_role из API). Используется сессионный клиент."
      );
    }
    return null;
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** PostgREST: service_role при наличии, иначе сессия (cookie). */
export async function getServerDb(): Promise<SupabaseClient> {
  return createServiceRoleClient() ?? (await createServerClient());
}
