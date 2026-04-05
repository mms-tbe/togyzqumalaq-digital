import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Прямое подключение к Postgres (обходит PostgREST). Нужен пароль из «Database».
 * Если пароля нет — не задавай `DATABASE_URL`; используй `SUPABASE_SERVICE_ROLE_KEY` (см. lib/supabase/db.ts).
 * Только сервер: `DATABASE_URL` (не NEXT_PUBLIC_*).
 *
 * SSL: если сервер без TLS и ошибка «does not support SSL», не используй `sslmode=require` в URI;
 * при необходимости добавь `?sslmode=disable`.
 * Схема: при «relation public.profiles does not exist» выполни `npm run db:apply-schema`
 * (файл `supabase/pg_direct_minimal.sql`).
 */
export function getPgPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 8 });
  }
  return pool;
}
