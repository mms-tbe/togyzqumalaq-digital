"use server";

import { createClient } from "@/lib/supabase/server";
import { OCR_SYSTEM_PROMPT, OCR_USER_PROMPT } from "@/lib/ocr/prompt";

export async function triggerOcr(filePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  // Create OCR job
  const { data: job, error: jobError } = await supabase
    .from("ocr_jobs")
    .insert({
      user_id: user.id,
      file_path: filePath,
      model: "deepseek-ocr",
      status: "pending",
      progress: 0,
    })
    .select()
    .single();

  if (jobError || !job) return { error: jobError?.message || "Ошибка создания задачи" };

  // Start processing asynchronously
  processOcr(job.id, filePath).catch(console.error);

  return { jobId: job.id };
}

async function processOcr(jobId: string, filePath: string) {
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  try {
    // Update status
    await supabase
      .from("ocr_jobs")
      .update({ status: "processing", progress: 10 })
      .eq("id", jobId);

    // Get signed URL for the image
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("sheets")
      .createSignedUrl(filePath, 600);

    if (urlError || !signedUrlData?.signedUrl) {
      throw new Error(`Ошибка получения URL: ${urlError?.message}`);
    }

    await supabase
      .from("ocr_jobs")
      .update({ progress: 30 })
      .eq("id", jobId);

    // Call DeepSeek OCR API
    const response = await fetch("https://llm.alem.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_OCR_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ocr",
        temperature: 0,
        messages: [
          { role: "system", content: OCR_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: signedUrlData.signedUrl },
              },
              {
                type: "text",
                text: OCR_USER_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OCR API ошибка ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Пустой ответ от OCR модели");
    }

    await supabase
      .from("ocr_jobs")
      .update({
        status: "completed",
        progress: 100,
        raw_result: { content },
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    await supabase
      .from("ocr_jobs")
      .update({
        status: "failed",
        progress: 0,
        error_message: message,
      })
      .eq("id", jobId);
  }
}

export async function getOcrJobStatus(jobId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ocr_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) return { error: error.message };
  return { job: data };
}
