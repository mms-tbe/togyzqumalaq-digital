import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Прямое подключение к Postgres (обходит PostgREST). Нужен пароль из «Database».
 * Если пароля нет — не задавай `DATABASE_URL`; используй `SUPABASE_SERVICE_ROLE_KEY` (см. lib/supabase/db.ts).
 * Только сервер: `DATABASE_URL` (не NEXT_PUBLIC_*).
 */
export function getPgPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 8 });
  }
  return pool;
}
