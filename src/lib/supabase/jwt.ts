/**
 * Supabase anon / service_role keys from the dashboard are JWTs (header.payload.sig).
 * Malformed env (short string, secret name instead of key) triggers:
 * "Expected 3 parts in JWT; got 1"
 */
export function looksLikeSupabaseJwtKey(key: string | undefined | null): boolean {
  if (!key || typeof key !== "string") return false;
  const t = key.trim();
  const parts = t.split(".");
  if (parts.length !== 3) return false;
  if (!parts.every((p) => p.length > 10)) return false;
  return t.length >= 40;
}
