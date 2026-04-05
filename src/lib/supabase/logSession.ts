import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseDebug } from "@/lib/logger";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    b64 += pad;
    const json = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Логи для отладки `role "" does not exist`: пустой/missing `role` в JWT → PostgREST не может SET ROLE.
 * Включить: SUPABASE_DEBUG=1 или DEBUG_TOGYZ=1 в .env.local
 */
export async function logSupabaseSessionForDebug(supabase: SupabaseClient, scope: string): Promise<void> {
  if (!isSupabaseDebug()) return;

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  console.info(`[togyz:${scope}] auth summary`, {
    hasSession: !!sessionData.session,
    sessionError: sessionErr?.message ?? null,
    getUserError: userErr?.message ?? null,
    userId: userData.user?.id ?? null,
  });

  const token = sessionData.session?.access_token;
  if (!token) {
    console.warn(`[togyz:${scope}] no access_token on session — check cookies / login`);
    return;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    console.warn(`[togyz:${scope}] access_token is not a decodable JWT (3 parts)`);
    return;
  }

  const role = payload.role;
  const roleLabel =
    role === undefined ? "(missing)" : role === "" ? "(empty string — частая причина role \"\" does not exist)" : String(role);

  console.info(`[togyz:${scope}] JWT payload (без подписи; не логируем полный токен)`, {
    role: roleLabel,
    iss: payload.iss,
    sub: payload.sub,
    aud: payload.aud,
    exp: payload.exp,
  });

  if (role === "" || role === undefined) {
    console.warn(
      `[togyz:${scope}] JWT без корректного "role" → PostgREST может выполнить SET ROLE "" и Postgres ответит: role "" does not exist. Нужна починка JWT на стороне Supabase/GoTrue или service_role для БД.`
    );
  }
}
