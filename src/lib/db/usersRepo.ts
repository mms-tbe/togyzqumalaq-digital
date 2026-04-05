import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

export type UserWithPassword = {
  id: string;
  email: string;
  password_hash: string | null;
  display_name: string;
  club: string | null;
  rating: number | null;
  role: string | null;
  created_at: Date;
};

export type PublicUser = {
  id: string;
  email: string | null;
  display_name: string;
  club: string | null;
  rating: number | null;
  role: string | null;
  created_at: Date;
};

export async function findUserByEmail(pool: Pool, email: string): Promise<UserWithPassword | null> {
  const r = await pool.query<UserWithPassword>(
    `SELECT id, email, password_hash, display_name, club, rating, role::text AS role, created_at
     FROM public.profiles WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [email]
  );
  return r.rows[0] ?? null;
}

export async function getUserByIdPublic(pool: Pool, id: string): Promise<PublicUser | null> {
  const r = await pool.query<PublicUser>(
    `SELECT id, email, display_name, club, rating, role::text AS role, created_at
     FROM public.profiles WHERE id = $1`,
    [id]
  );
  return r.rows[0] ?? null;
}

export async function createUser(
  pool: Pool,
  email: string,
  passwordHash: string,
  displayName: string
): Promise<string> {
  const id = randomUUID();
  const r = await pool.query<{ id: string }>(
    `INSERT INTO public.profiles (id, email, password_hash, display_name)
     VALUES ($1, lower(trim($2)), $3, $4)
     RETURNING id`,
    [id, email, passwordHash, displayName]
  );
  const out = r.rows[0]?.id;
  if (!out) throw new Error("INSERT profiles не вернул id");
  return out;
}

export async function listProfilesPublic(pool: Pool) {
  const r = await pool.query<{
    id: string;
    email: string | null;
    display_name: string;
    club: string | null;
    rating: number | null;
    role: string | null;
    created_at: Date;
  }>(
    `SELECT id, email, display_name, club, rating, role::text AS role, created_at
     FROM public.profiles ORDER BY created_at DESC`
  );
  return r.rows;
}

export async function updateProfileFields(
  pool: Pool,
  userId: string,
  fields: { display_name: string; club: string | null; rating: number }
): Promise<void> {
  await pool.query(
    `UPDATE public.profiles SET display_name = $2, club = $3, rating = $4, updated_at = now()
     WHERE id = $1`,
    [userId, fields.display_name, fields.club, fields.rating]
  );
}
