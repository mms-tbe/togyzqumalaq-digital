import { type PitIndex } from "@/lib/engine/types";
import { createInitialBoard, makeMove } from "@/lib/engine/TogyzEngine";
import type { GameSummary, StoredGame } from "@/lib/games/types";

export function parseGameNotes(notes: string | null | undefined): {
  white: string;
  black: string;
  tournament?: string;
} {
  if (!notes) return { white: "", black: "" };
  const white = notes.match(/Белые:\s*([^,]+)/)?.[1]?.trim() ?? "";
  const black = notes.match(/Чёрные:\s*([^,]+)/)?.[1]?.trim() ?? "";
  const tournament = notes.match(/Турнир:\s*(.+?)(?:,|$)/)?.[1]?.trim();
  return { white, black, tournament: tournament || undefined };
}

export function dbResultToDisplay(r: string): string {
  switch (r) {
    case "white":
      return "1-0";
    case "black":
      return "0-1";
    case "draw":
      return "1/2-1/2";
    default:
      return "ongoing";
  }
}

/** Результат из формы или движка → строка для saveGame */
export function normalizeResultForSave(r: string | null | undefined): string {
  if (!r || r === "ongoing") return "ongoing";
  if (r === "white") return "1-0";
  if (r === "black") return "0-1";
  if (r === "draw") return "1/2-1/2";
  return r;
}

type DbMoveRow = {
  move_number: number;
  side: string;
  from_pit: number;
};

type DbGameRow = {
  id: string;
  created_at: string;
  notes: string | null;
  result: string;
  source_type: string;
  ocr_model_used?: string | null;
};

function sortMovesForReplay(moves: DbMoveRow[]): DbMoveRow[] {
  return [...moves].sort((a, b) => {
    if (a.move_number !== b.move_number) return a.move_number - b.move_number;
    if (a.side === b.side) return 0;
    return a.side === "white" ? -1 : 1;
  });
}

export function buildStoredGameFromDb(game: DbGameRow, moves: DbMoveRow[]): StoredGame {
  const parsed = parseGameNotes(game.notes);
  let board = createInitialBoard();
  const movesOut: StoredGame["moves"] = [];
  for (const m of sortMovesForReplay(moves)) {
    const r = makeMove(board, m.from_pit as PitIndex);
    if (!r) continue;
    board = r.boardAfter;
    movesOut.push({
      moveNumber: m.move_number,
      side: m.side as "white" | "black",
      notation: r.notation,
    });
  }
  return {
    id: game.id,
    whitePlayer: parsed.white,
    blackPlayer: parsed.black,
    tournament: parsed.tournament,
    result: dbResultToDisplay(game.result),
    sourceType: game.source_type as "ocr" | "manual",
    createdAt: game.created_at,
    ocrModelUsed: game.ocr_model_used ?? undefined,
    moves: movesOut,
  };
}

/** Строка списка из ответа games + вложенный count ходов */
export function rowToGameSummary(
  row: DbGameRow & { moves?: { count: number }[] | { count: number } | null }
): GameSummary {
  const parsed = parseGameNotes(row.notes);
  let moveCount = 0;
  const nested = row.moves;
  if (Array.isArray(nested) && nested[0] && typeof nested[0].count === "number") {
    moveCount = nested[0].count;
  } else if (nested && typeof nested === "object" && "count" in nested && typeof nested.count === "number") {
    moveCount = nested.count;
  }
  return {
    id: row.id,
    whitePlayer: parsed.white,
    blackPlayer: parsed.black,
    tournament: parsed.tournament,
    result: dbResultToDisplay(row.result),
    sourceType: row.source_type as "ocr" | "manual",
    createdAt: row.created_at,
    moveCount,
  };
}
