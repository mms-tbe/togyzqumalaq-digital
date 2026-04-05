"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
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

/** Список public.profiles (виден всем авторизованным — см. RLS в миграции). */
export async function listUsers(): Promise<{ users: ProfileRow[] } | { error: string }> {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = await getServerDb();
  const { data, error } = await db
    .from("profiles")
    .select("id, email, display_name, club, rating, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    logDbError("users.list", error);
    return { error: error.message };
  }

  return { users: (data ?? []) as ProfileRow[] };
}
