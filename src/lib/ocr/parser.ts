import { type PitIndex } from "@/lib/engine/types";

export interface OcrMove {
  n: number;
  /** White move notation: "76", "52X", or "" if empty */
  w: string;
  /** Black move notation: "76", "52X", or "" if empty */
  b: string;
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
        w: String(m.w ?? ""),
        b: String(m.b ?? ""),
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

  // Extract moves from markdown tables
  // Tables can be wide: | №  | Ак  | Кара  | №  | Ак  | Кара  | №  | Ак  | Кара  |
  // Or narrow: | №  | Ак  | Кара  |
  let match;

  // Parse each table row — extract ALL cells, then group into triplets (№, Ак, Кара)
  for (const line of lines) {
    // Skip header/separator rows
    if (line.includes("---") || line.includes("Ак") || line.includes("Кара") || line.includes("№")) continue;

    // Extract all cell values from a pipe-delimited row
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length < 3) continue;

    // Group cells into triplets: [moveNum, white, black]
    for (let i = 0; i + 2 < cells.length; i += 3) {
      const moveNum = parseInt(cells[i]);
      if (isNaN(moveNum) || moveNum < 1 || moveNum > 200) continue;

      const whiteVal = cells[i + 1];
      const blackVal = cells[i + 2];

      // Skip if values look like headers
      if (/[а-яА-Я]/.test(whiteVal) || /[а-яА-Я]/.test(blackVal)) continue;

      const existing = moves.find((m) => m.n === moveNum);
      if (!existing) {
        moves.push({ n: moveNum, w: whiteVal, b: blackVal });
      }
    }
  }

  // Fallback 1: line-based "1. 78 16" or "1  78  16"
  if (moves.length === 0) {
    const lineRegex = /^\s*(\d+)[\.\)]\s+(\d+)\s+(\d+)/gm;
    while ((match = lineRegex.exec(raw)) !== null) {
      const moveNum = parseInt(match[1]);
      if (moveNum >= 1 && moveNum <= 200) {
        moves.push({ n: moveNum, w: match[2].trim(), b: match[3].trim() });
      }
    }
  }

  // Fallback 2: any row of 3+ numbers separated by spaces/tabs
  if (moves.length === 0) {
    const numRowRegex = /(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/g;
    let seqNum = 1;
    while ((match = numRowRegex.exec(raw)) !== null) {
      const a = parseInt(match[1]);
      const b = parseInt(match[2]);
      const c = parseInt(match[3]);
      // First number is move number if it matches sequence
      if (a === seqNum && b >= 1 && b <= 99 && c >= 1 && c <= 99) {
        moves.push({ n: a, w: match[2], b: match[3] });
        seqNum++;
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
    const wp = m.w ? parseInt(m.w[0]) : null;
    const bp = m.b ? parseInt(m.b[0]) : null;
    result.push(wp && wp >= 1 && wp <= 9 ? (wp as PitIndex) : null);
    result.push(bp && bp >= 1 && bp <= 9 ? (bp as PitIndex) : null);
  }
  return result;
}
