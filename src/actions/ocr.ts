"use server";

import { OCR_USER_PROMPT } from "@/lib/ocr/prompt";

export type OcrModel = "deepseek-ocr" | "paddle-ocr";

/**
 * DeepSeek OCR via alem.plus API
 */
async function processDeepseek(base64Image: string, mimeType: string): Promise<{ content?: string; error?: string }> {
  try {
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

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
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: OCR_USER_PROMPT },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `DeepSeek OCR ошибка ${response.status}: ${errText.slice(0, 300)}` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return { error: `Пустой ответ от DeepSeek OCR. Raw: ${JSON.stringify(result).slice(0, 300)}` };
    }

    return { content };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка DeepSeek OCR" };
  }
}

/**
 * PaddleOCR via layout-parsing API
 */
async function processPaddleOcr(base64Image: string): Promise<{ content?: string; error?: string }> {
  try {
    const response = await fetch("https://s4i7qbz4a6o7x3fe.aistudio-app.com/layout-parsing", {
      method: "POST",
      headers: {
        "Authorization": "token e0961a88f30275cc6d4c5e750a5ece24d6859f53",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Image,
        fileType: 1, // image
        useDocOrientationClassify: false,
        useDocUnwarping: false,
        useChartRecognition: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `PaddleOCR ошибка ${response.status}: ${errText.slice(0, 300)}` };
    }

    const result = await response.json();
    const layoutResults = result?.result?.layoutParsingResults;

    if (!layoutResults || layoutResults.length === 0) {
      return { error: `PaddleOCR не распознал документ. Raw: ${JSON.stringify(result).slice(0, 300)}` };
    }

    // Combine all markdown text from layout parsing
    const markdownText = layoutResults
      .map((res: { markdown?: { text?: string } }) => res.markdown?.text || "")
      .join("\n");

    if (!markdownText.trim()) {
      return { error: "PaddleOCR вернул пустой текст." };
    }

    return { content: markdownText };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка PaddleOCR" };
  }
}

/**
 * Unified OCR entry point — dispatches to selected model
 */
export async function processOcrDirect(
  base64Image: string,
  mimeType: string,
  model: OcrModel = "deepseek-ocr"
): Promise<{ content?: string; error?: string }> {
  switch (model) {
    case "paddle-ocr":
      return processPaddleOcr(base64Image);
    case "deepseek-ocr":
    default:
      return processDeepseek(base64Image, mimeType);
  }
}
