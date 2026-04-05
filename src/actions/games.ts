"use server";

import { getSession } from "@/lib/auth/session";
import { getPgPool } from "@/lib/db/pool";
import * as gamesRepo from "@/lib/db/gamesRepo";
import { logDbError } from "@/lib/logger";
import { type PitIndex } from "@/lib/engine/types";
import { createInitialBoard, makeMove } from "@/lib/engine/TogyzEngine";
import { buildStoredGameFromDb, rowToGameSummary } from "@/lib/games/view";
import type { GameSummary, StoredGame, SaveGameInput } from "@/lib/games/types";

export type { SaveGameInput } from "@/lib/games/types";

export async function saveGame(input: SaveGameInput) {
  const pool = getPgPool();
  if (!pool) return { error: "База данных не настроена (DATABASE_URL)." };
  const session = await getSession();
  if (!session) return { error: "Не авторизован" };

  let board = createInitialBoard();
  const movesWithFen: { moveNumber: number; side: "white" | "black"; pit: number; fen: string }[] = [];

  for (const move of input.moves) {
    const pit = parseInt(move.notation[0]) as PitIndex;
    if (!pit || pit < 1 || pit > 9) {
      return { error: `Невалидная нотация: ${move.notation}` };
    }
    const result = makeMove(board, pit);
    if (!result) {
      return { error: `Невалидный ход #${move.moveNumber} ${move.side}: ${move.notation}` };
    }
    movesWithFen.push({
      moveNumber: move.moveNumber,
      side: move.side,
      pit,
      fen: result.fen,
    });
    board = result.boardAfter;
  }

  try {
    const gameId = await gamesRepo.saveGameTransaction(
      pool,
      session.sub,
      session.email ?? "",
      input,
      movesWithFen
    );
    return { gameId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка БД";
    logDbError("games.pg.save", { message: msg });
    return { error: msg };
  }
}

export async function getGames(): Promise<{ games: GameSummary[] } | { error: string; games: [] }> {
  const pool = getPgPool();
  if (!pool) return { error: "База данных не настроена", games: [] };
  const session = await getSession();
  if (!session) return { error: "Не авторизован", games: [] };

  try {
    const rows = await gamesRepo.listGames(pool, session.sub);
    const games = rows.map((row) =>
      rowToGameSummary({
        id: row.id,
        created_at:
          row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        notes: row.notes,
        result: row.result,
        source_type: row.source_type,
        ocr_model_used: row.ocr_model_used,
        moves: [{ count: Number(row.move_count) }],
      } as never)
    );
    return { games };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка БД";
    logDbError("games.pg.list", { message: msg });
    return { error: msg, games: [] };
  }
}

export async function getGameById(id: string): Promise<{ game: StoredGame } | { error: string }> {
  const pool = getPgPool();
  if (!pool) return { error: "База данных не настроена" };
  const session = await getSession();
  if (!session) return { error: "Не авторизован" };

  try {
    const game = await gamesRepo.getGameRow(pool, id, session.sub);
    if (!game) return { error: "Партия не найдена" };
    const moves = await gamesRepo.getMovesRows(pool, id);
    const gameRow = {
      ...game,
      created_at:
        game.created_at instanceof Date ? game.created_at.toISOString() : String(game.created_at),
    };
    return { game: buildStoredGameFromDb(gameRow as never, moves) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка БД";
    logDbError("games.pg.get", { message: msg });
    return { error: msg };
  }
}

export async function deleteGame(id: string) {
  const pool = getPgPool();
  if (!pool) return { error: "База данных не настроена" };
  const session = await getSession();
  if (!session) return { error: "Не авторизован" };

  try {
    const ok = await gamesRepo.deleteGameRow(pool, id, session.sub);
    if (!ok) return { error: "Партия не найдена" };
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка БД";
    logDbError("games.pg.delete", { message: msg });
    return { error: msg };
  }
}
