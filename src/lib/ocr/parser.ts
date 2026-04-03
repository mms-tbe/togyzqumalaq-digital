import { type PitIndex } from "@/lib/engine/types";

export interface OcrMove {
  n: number;
  w: number | null;
  b: number | null;
}

export interface OcrResult {
  tournament: string | null;
  round: number | null;
  table: number | null;
  date: string | null;
  white_player: string | null;
  black_player: string | null;
  result: string | null;
  moves: OcrMove[];
}

export interface ParsedMove {
  moveNumber: number;
  side: "white" | "black";
  pit: PitIndex | null;
  isValid: boolean;
  error?: string;
}

/**
 * Parse raw OCR API response content into structured OcrResult.
 * Handles cases where the model wraps JSON in markdown code blocks.
 */
export function parseOcrResponse(rawContent: string): OcrResult | null {
  try {
    // Remove markdown code block wrappers if present
    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Validate and sanitize
    return {
      tournament: parsed.tournament ?? null,
      round: typeof parsed.round === "number" ? parsed.round : null,
      table: typeof parsed.table === "number" ? parsed.table : null,
      date: parsed.date ?? null,
      white_player: parsed.white_player ?? null,
      black_player: parsed.black_player ?? null,
      result: parsed.result ?? null,
      moves: Array.isArray(parsed.moves)
        ? parsed.moves.map((m: { n?: number; w?: number | null; b?: number | null }) => ({
            n: m.n ?? 0,
            w: typeof m.w === "number" && m.w >= 1 && m.w <= 9 ? m.w : null,
            b: typeof m.b === "number" && m.b >= 1 && m.b <= 9 ? m.b : null,
          }))
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Convert OCR moves into a flat array of ParsedMoves for validation.
 */
export function ocrMovesToParsed(ocrMoves: OcrMove[]): ParsedMove[] {
  const result: ParsedMove[] = [];

  for (const move of ocrMoves) {
    if (move.w !== null) {
      result.push({
        moveNumber: move.n,
        side: "white",
        pit: move.w as PitIndex,
        isValid: true,
      });
    } else {
      result.push({
        moveNumber: move.n,
        side: "white",
        pit: null,
        isValid: false,
        error: "Не удалось распознать",
      });
    }

    if (move.b !== null) {
      result.push({
        moveNumber: move.n,
        side: "black",
        pit: move.b as PitIndex,
        isValid: true,
      });
    } else if (move.w !== null) {
      // Black's move might not exist for the last move
      // Only add if it's not the last move or result suggests game continues
      result.push({
        moveNumber: move.n,
        side: "black",
        pit: null,
        isValid: false,
        error: "Не удалось распознать",
      });
    }
  }

  return result;
}

/**
 * Extract just the pit numbers for engine validation (skip nulls).
 */
export function extractPitSequence(parsed: ParsedMove[]): (PitIndex | null)[] {
  return parsed.map((m) => m.pit);
}
