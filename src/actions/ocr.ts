"use server";

import { OCR_SYSTEM_PROMPT, OCR_USER_PROMPT } from "@/lib/ocr/prompt";

/**
 * Direct OCR: receives base64 image, calls DeepSeek OCR, returns raw text.
 * Image is resized on the client before sending (max ~800px).
 */
export async function processOcrDirect(base64Image: string, mimeType: string) {
  try {
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Combined prompt (no system message — some vision models ignore it)
    const fullPrompt = `${OCR_SYSTEM_PROMPT}\n\n${OCR_USER_PROMPT}`;

    const response = await fetch("https://llm.alem.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_OCR_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ocr",
        temperature: 0,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
              {
                type: "text",
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `OCR API ошибка ${response.status}: ${errText.slice(0, 300)}` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      // Return raw response for debugging
      return { error: `Пустой ответ от OCR. Raw: ${JSON.stringify(result).slice(0, 300)}` };
    }

    return { content };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Неизвестная ошибка OCR" };
  }
}
