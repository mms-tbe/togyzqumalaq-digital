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

/**
 * Parse OCR response — handles both JSON and free-text/markdown table formats.
 *
 * Free text format from DeepSeek OCR looks like:
 * | 1  | 43  | 92  |
 * | 2  | 39  | 42  |
 *
 * Each row: move_number, white_pit (two-digit = from+to notation), black_pit
 * We extract the FIRST digit of each two-digit value as the pit number (1-9).
 */
export function parseOcrResponse(rawContent: string): OcrResult | null {
  // Try JSON first
  const jsonResult = tryParseJson(rawContent);
  if (jsonResult) return jsonResult;

  // Parse free-text / markdown table format
  return parseMarkdownTable(rawContent);
}

function tryParseJson(raw: string): OcrResult | null {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    if (!parsed.moves && !Array.isArray(parsed)) return null;

    const moves = Array.isArray(parsed) ? parsed : parsed.moves;
    return {
      tournament: parsed.tournament ?? null,
      round: parsed.round ?? null,
      table: parsed.table ?? null,
      date: parsed.date ?? null,
      white_player: parsed.white_player ?? null,
      black_player: parsed.black_player ?? null,
      result: parsed.result ?? null,
      moves: moves.map((m: Record<string, unknown>) => ({
        n: Number(m.n) || 0,
        w: validPit(m.w),
        b: validPit(m.b),
      })),
    };
  } catch {
    return null;
  }
}

function validPit(val: unknown): number | null {
  const n = Number(val);
  return n >= 1 && n <= 9 ? n : null;
}

/**
 * Parse markdown tables and free text from OCR response.
 * Extracts rows like: | 1 | 43 | 92 | or "1. 4 9"
 * For two-digit values (like "43"), take first digit as pit number.
 */
function parseMarkdownTable(raw: string): OcrResult | null {
  const moves: OcrMove[] = [];
  const lines = raw.split("\n");

  // Extract player names
  let whiteName: string | null = null;
  let blackName: string | null = null;

  for (const line of lines) {
    const wMatch = line.match(/Бастау[шы]*[:：]\s*(.+)/i);
    if (wMatch) whiteName = wMatch[1].trim();
    const bMatch = line.match(/Костау[шы]*[:：]\s*(.+)/i);
    if (bMatch) blackName = bMatch[1].trim();
  }

  // Extract move rows from markdown tables
  // Pattern: | number | number | number |
  const tableRowRegex = /\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/g;
  let match;

  while ((match = tableRowRegex.exec(raw)) !== null) {
    const moveNum = parseInt(match[1]);
    const whiteVal = match[2];
    const blackVal = match[3];

    if (moveNum < 1 || moveNum > 100) continue;

    // For two-digit values like "43": first digit = pit (4), second = landing
    // For single digit "4": pit = 4
    const wPit = extractPitFromNotation(whiteVal);
    const bPit = extractPitFromNotation(blackVal);

    // Check if this move number already exists (multiple tables on sheet)
    const existing = moves.find((m) => m.n === moveNum);
    if (!existing) {
      moves.push({ n: moveNum, w: wPit, b: bPit });
    }
  }

  // If no table rows found, try line-based parsing: "1. 4 9" or "1  4  9"
  if (moves.length === 0) {
    const lineRegex = /^\s*(\d+)[\.\)]\s+(\d+)\s+(\d+)/gm;
    while ((match = lineRegex.exec(raw)) !== null) {
      const moveNum = parseInt(match[1]);
      const wPit = extractPitFromNotation(match[2]);
      const bPit = extractPitFromNotation(match[3]);
      if (moveNum >= 1 && moveNum <= 100) {
        moves.push({ n: moveNum, w: wPit, b: bPit });
      }
    }
  }

  if (moves.length === 0) return null;

  // Sort by move number
  moves.sort((a, b) => a.n - b.n);

  return {
    tournament: null,
    round: null,
    table: null,
    date: null,
    white_player: whiteName,
    black_player: blackName,
    result: null,
    moves,
  };
}

/**
 * Extract pit number (1-9) from OCR notation.
 * "43" → first digit 4 (pit number in togyzqumalaq)
 * "9" → 9
 * "91" → 9
 */
function extractPitFromNotation(val: string): number | null {
  const trimmed = val.trim();
  if (!trimmed || trimmed === "0") return null;

  const firstDigit = parseInt(trimmed[0]);
  if (firstDigit >= 1 && firstDigit <= 9) return firstDigit;

  return null;
}

export function ocrMovesToParsed(ocrMoves: OcrMove[]) {
  return ocrMoves.map((m) => ({
    moveNumber: m.n,
    white: m.w,
    black: m.b,
  }));
}

export function extractPitSequence(moves: OcrMove[]): (PitIndex | null)[] {
  const result: (PitIndex | null)[] = [];
  for (const m of moves) {
    result.push(m.w as PitIndex | null);
    result.push(m.b as PitIndex | null);
  }
  return result;
}
