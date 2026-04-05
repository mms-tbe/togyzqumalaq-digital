import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Прямое подключение к Postgres (сервер только). Нужен `DATABASE_URL`.
 * Аутентификация и партии хранятся в БД; Supabase API не используется.
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
