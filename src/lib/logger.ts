/**
 * Отладочные логи сервера. Включить в `.env.local` одно из:
 * - SUPABASE_DEBUG=1 — сессия/JWT + полные ошибки PostgREST (hint/details)
 * - DEBUG_TOGYZ=1 — то же + прочие [togyz:...] логи
 */
export function isSupabaseDebug(): boolean {
  return process.env.SUPABASE_DEBUG === "1" || process.env.DEBUG_TOGYZ === "1";
}

const legacyDebug = process.env.DEBUG_TOGYZ === "1";

export function logDebug(scope: string, message: string, extra?: Record<string, unknown>) {
  if (!legacyDebug) return;
  if (extra && Object.keys(extra).length > 0) {
    console.info(`[togyz:${scope}]`, message, extra);
  } else {
    console.info(`[togyz:${scope}]`, message);
  }
}

/** Ошибки PostgREST / Postgres (code, details, hint) — при SUPABASE_DEBUG или DEBUG_TOGYZ */
export function logDbError(
  scope: string,
  err: { message?: string; code?: string; details?: string; hint?: string }
) {
  if (!isSupabaseDebug()) return;
  console.warn(`[togyz:${scope}]`, err.message || err.code || "unknown", {
    code: err.code,
    details: typeof err.details === "string" ? err.details.slice(0, 800) : err.details,
    hint: err.hint,
  });
}
