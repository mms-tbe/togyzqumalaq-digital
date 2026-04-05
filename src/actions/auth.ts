"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import { logDbError } from "@/lib/logger";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile manually (no DB trigger on auth.users in this instance)
  if (data.user) {
    const db = await getServerDb();
    await db.from("profiles").upsert({
      id: data.user.id,
      display_name: displayName || email,
      email,
    }, { onConflict: "id" });
  }

  redirect("/upload");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure profile exists; синхронизируем email, имя не затираем пустым
  if (data.user) {
    const db = await getServerDb();
    const { data: row } = await db
      .from("profiles")
      .select("display_name")
      .eq("id", data.user.id)
      .maybeSingle();
    const displayName =
      (row?.display_name && String(row.display_name).trim()) ||
      data.user.email ||
      "";
    await db.from("profiles").upsert(
      {
        id: data.user.id,
        display_name: displayName,
        email: data.user.email ?? null,
      },
      { onConflict: "id" }
    );
  }

  redirect("/upload");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = await getServerDb();

  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) logDbError("profile.get", error);
  return data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = await getServerDb();

  const { error } = await db
    .from("profiles")
    .update({
      display_name: formData.get("displayName") as string,
      club: formData.get("club") as string,
    })
    .eq("id", user.id);

  if (error) {
    logDbError("profile.update", error);
    return { error: error.message };
  }
  return { success: true };
}
