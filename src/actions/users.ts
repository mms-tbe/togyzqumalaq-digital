"use server";

import { getSession } from "@/lib/auth/session";
import { getPgPool } from "@/lib/db/pool";
import * as usersRepo from "@/lib/db/usersRepo";
import { logDbError } from "@/lib/logger";

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string;
  club: string | null;
  rating: number | null;
  role: string | null;
  created_at: string;
};

export async function listUsers(): Promise<{ users: ProfileRow[] } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Не авторизован" };

  const pool = getPgPool();
  if (!pool) return { error: "База данных не настроена" };

  try {
    const rows = await usersRepo.listProfilesPublic(pool);
    const users: ProfileRow[] = rows.map((u) => ({
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      club: u.club,
      rating: u.rating,
      role: u.role,
      created_at: u.created_at instanceof Date ? u.created_at.toISOString() : String(u.created_at),
    }));
    return { users };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка БД";
    logDbError("users.list", { message: msg });
    return { error: msg };
  }
}
