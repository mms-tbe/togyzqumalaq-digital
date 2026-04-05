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
 * AlemLLM — post-process raw OCR text into structured move table.
 * Uses the AlemLLM model from alem.plus to extract numbers from noisy OCR text.
 */
async function structureWithAlemLLM(rawOcrText: string): Promise<string> {
  try {
    const response = await fetch("https://llm.alem.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ALEMLLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "alemllm",
        temperature: 0,
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `Extract move numbers from this togyzqumalaq score sheet OCR text. Output ONLY a markdown table with columns: | № | Ак | Кара |. Each row = one move. Only include rows where all 3 values are numbers. Skip all text, names, headers.\n\nOCR text:\n${rawOcrText.slice(0, 3000)}`,
        }],
      }),
    });

    if (!response.ok) return rawOcrText; // Fallback to raw text

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    return content || rawOcrText;
  } catch {
    return rawOcrText; // Fallback to raw text on any error
  }
}

/**
 * Unified OCR entry point — dispatches to selected model.
 * After OCR, optionally passes through AlemLLM for structured extraction.
 */
export async function processOcrDirect(
  base64Image: string,
  mimeType: string,
  model: OcrModel = "deepseek-ocr"
): Promise<{ content?: string; error?: string }> {
  let result: { content?: string; error?: string };

  switch (model) {
    case "paddle-ocr":
      result = await processPaddleOcr(base64Image);
      break;
    case "deepseek-ocr":
    default:
      result = await processDeepseek(base64Image, mimeType);
      break;
  }

  // If OCR succeeded, pass through AlemLLM for structured extraction
  if (result.content && process.env.ALEMLLM_API_KEY) {
    const structured = await structureWithAlemLLM(result.content);
    return { content: structured };
  }

  return result;
}
