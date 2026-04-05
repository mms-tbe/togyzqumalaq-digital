/**
 * Supabase anon public key from the dashboard is a JWT (header.payload.sig).
 * Malformed env triggers: "Expected 3 parts in JWT; got 1"
 */

/** Trim, remove accidental line breaks in pasted JWTs, strip optional "Bearer " prefix */
export function normalizeSupabaseKey(key: string | undefined | null): string {
  if (!key || typeof key !== "string") return "";
  let t = key.trim().replace(/\s/g, "");
  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }
  return t;
}

export function looksLikeSupabaseJwtKey(key: string | undefined | null): boolean {
  const t = normalizeSupabaseKey(key);
  if (!t) return false;
  const parts = t.split(".");
  if (parts.length !== 3) return false;
  return parts.every((p) => p.length > 0);
}
