import { type BoardState } from "./types";
import { boardToFen } from "./TogyzEngine";

export interface PgnMove {
  moveNumber: number;
  white: string; // notation like "76(10)"
  black?: string;
}

/**
 * Generate PGN string from move notations.
 * Format matches playstrategy.org:
 * [Variant "Togyzqumalaq"]
 * [FEN "9S,9S,..."]
 * 1. 76(10) 55(10) 2. 33 77X ...
 */
export function generatePgn(
  moves: { notation: string; side: "white" | "black" }[],
  options?: {
    white?: string;
    black?: string;
    event?: string;
    date?: string;
    result?: string;
  }
): string {
  const headers: string[] = [];
  headers.push('[Variant "Togyzqumalaq"]');
  headers.push('[FEN "9S,9S,9S,9S,9S,9S,9S,9S,9S/9S,9S,9S,9S,9S,9S,9S,9S,9S 0 0 S 1"]');
  if (options?.event) headers.push(`[Event "${options.event}"]`);
  if (options?.white) headers.push(`[White "${options.white}"]`);
  if (options?.black) headers.push(`[Black "${options.black}"]`);
  if (options?.date) headers.push(`[Date "${options.date}"]`);
  if (options?.result) headers.push(`[Result "${options.result}"]`);

  // Build move text
  const moveText: string[] = [];
  let moveNum = 1;
  for (let i = 0; i < moves.length; i += 2) {
    const w = moves[i]?.notation || "";
    const b = moves[i + 1]?.notation || "";
    if (b) {
      moveText.push(`${moveNum}. ${w} ${b}`);
    } else {
      moveText.push(`${moveNum}. ${w}`);
    }
    moveNum++;
  }

  if (options?.result) {
    moveText.push(options.result);
  }

  return headers.join("\n") + "\n\n" + moveText.join(" ");
}

/**
 * Convert move notations to PgnMove array for the move list display.
 */
export function toPgnMoves(
  moves: { notation: string; side: "white" | "black" }[]
): PgnMove[] {
  const result: PgnMove[] = [];
  let moveNum = 1;

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (m.side === "white") {
      // New white row after an unfinished row: next full-move number
      if (result.length > 0 && !result[result.length - 1].black) {
        moveNum++;
      }
      result.push({ moveNumber: moveNum, white: m.notation });
    } else {
      if (result.length > 0 && !result[result.length - 1].black) {
        result[result.length - 1].black = m.notation;
      } else {
        result.push({ moveNumber: moveNum, white: "...", black: m.notation });
      }
      moveNum++;
    }
  }

  return result;
}
