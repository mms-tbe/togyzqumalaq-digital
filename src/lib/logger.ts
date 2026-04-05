/**
 * Opt-in debug logging. Set DEBUG_TOGYZ=1 in .env.local to enable.
 */
const enabled = process.env.DEBUG_TOGYZ === "1";

export function logDebug(scope: string, message: string, extra?: Record<string, unknown>) {
  if (!enabled) return;
  if (extra && Object.keys(extra).length > 0) {
    console.info(`[togyz:${scope}]`, message, extra);
  } else {
    console.info(`[togyz:${scope}]`, message);
  }
}

export function logDbError(scope: string, err: { message?: string; code?: string; details?: string }) {
  if (!enabled) return;
  console.warn(`[togyz:${scope}]`, err.message || err.code || "unknown", {
    code: err.code,
    details: err.details?.slice?.(0, 120),
  });
}
