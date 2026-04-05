import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Прямое подключение к Postgres (обходит PostgREST и JWT на SQL-запросах).
 * В Supabase: Settings → Database → Connection string (URI), роль с правом писать в public.games.
 * Серверная переменная только: `DATABASE_URL` (не NEXT_PUBLIC_*).
 */
export function getPgPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 8 });
  }
  return pool;
}
