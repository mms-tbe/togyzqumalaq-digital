"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadSheet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const file = formData.get("file") as File;
  if (!file) return { error: "Файл не выбран" };

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Допустимые форматы: JPEG, PNG, PDF" };
  }

  // Validate file size (20MB)
  if (file.size > 20 * 1024 * 1024) {
    return { error: "Максимальный размер файла: 20 МБ" };
  }

  const timestamp = Date.now();
  const filePath = `${user.id}/${timestamp}_${file.name}`;

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.id === "sheets")) {
    await supabase.storage.createBucket("sheets", { public: false });
  }

  const { error } = await supabase.storage
    .from("sheets")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return { error: `Ошибка загрузки: ${error.message}` };

  return { filePath };
}
