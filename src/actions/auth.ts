"use server";

import { redirect } from "next/navigation";
import { getPgPool } from "@/lib/db/pool";
import * as usersRepo from "@/lib/db/usersRepo";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, getSession, setSessionCookie } from "@/lib/auth/session";
import { logDbError } from "@/lib/logger";

function poolOrError(): { pool: NonNullable<ReturnType<typeof getPgPool>> } | { error: string } {
  const pool = getPgPool();
  if (!pool) return { error: "Сервер: задайте DATABASE_URL (PostgreSQL)." };
  return { pool };
}

export async function signUp(formData: FormData) {
  const p = poolOrError();
  if ("error" in p) return { error: p.error };
  const { pool } = p;

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim();

  if (!email || !password || password.length < 6) {
    return { error: "Укажите email и пароль не короче 6 символов" };
  }
  if (!displayName) {
    return { error: "Укажите имя" };
  }

  const existing = await usersRepo.findUserByEmail(pool, email);
  if (existing) {
    return { error: "Этот email уже зарегистрирован" };
  }

  try {
    const pwHash = await hashPassword(password);
    const id = await usersRepo.createUser(pool, email, pwHash, displayName);
    await setSessionCookie(id, email);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/unique|duplicate/i.test(msg)) {
      return { error: "Этот email уже зарегистрирован" };
    }
    logDbError("auth.signUp", { message: msg });
    return { error: "Ошибка регистрации" };
  }
  redirect("/upload");
}

export async function signIn(formData: FormData) {
  const p = poolOrError();
  if ("error" in p) return { error: p.error };
  const { pool } = p;

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  const user = await usersRepo.findUserByEmail(pool, email);
  if (!user?.password_hash) {
    return { error: "Неверный email или пароль" };
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return { error: "Неверный email или пароль" };
  }

  await setSessionCookie(user.id, user.email ?? email);
  redirect("/upload");
}

export async function signOut() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getSessionUser() {
  return getSession();
}

export type ProfileData = {
  id: string;
  email: string | null;
  display_name: string;
  club: string | null;
  rating: number | null;
  role: string | null;
  created_at: string;
};

export async function getProfile(): Promise<ProfileData | null> {
  const session = await getSession();
  if (!session) return null;
  const pool = getPgPool();
  if (!pool) return null;
  const u = await usersRepo.getUserByIdPublic(pool, session.sub);
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    club: u.club,
    rating: u.rating,
    role: u.role,
    created_at: u.created_at instanceof Date ? u.created_at.toISOString() : String(u.created_at),
  };
}

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Не авторизован" };
  const pool = getPgPool();
  if (!pool) return { error: "База данных не настроена" };

  const displayName = String(formData.get("displayName") || "").trim();
  const club = String(formData.get("club") || "").trim() || null;
  const ratingRaw = Number(formData.get("rating"));
  const rating = Number.isFinite(ratingRaw) ? Math.round(ratingRaw) : 1200;

  try {
    await usersRepo.updateProfileFields(pool, session.sub, {
      display_name: displayName || session.email,
      club,
      rating,
    });
  } catch (e) {
    logDbError("profile.update", { message: e instanceof Error ? e.message : String(e) });
    return { error: "Не удалось сохранить профиль" };
  }
  return { success: true };
}
