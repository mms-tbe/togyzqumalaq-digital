"use server";

import { createClient } from "@/lib/supabase/server";
import { getPgPool } from "@/lib/db/pool";
import * as gamesRepo from "@/lib/db/gamesRepo";
import { logDbError } from "@/lib/logger";
import { type PitIndex } from "@/lib/engine/types";
import { createInitialBoard, makeMove } from "@/lib/engine/TogyzEngine";
import { buildStoredGameFromDb, rowToGameSummary } from "@/lib/games/view";
import type { GameSummary, StoredGame, SaveGameInput } from "@/lib/games/types";

export type { SaveGameInput } from "@/lib/games/types";

export async function saveGame(input: SaveGameInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

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

  const pool = getPgPool();
  if (pool) {
    try {
      const gameId = await gamesRepo.saveGameTransaction(pool, user.id, user.email ?? "", input, movesWithFen);
      return { gameId };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка БД";
      logDbError("games.pg.save", { message: msg });
      return { error: msg };
    }
  }

  await supabase.from("profiles").upsert(
    { id: user.id, display_name: user.email || "" },
    { onConflict: "id", ignoreDuplicates: true }
  );

  let gameResult: "white" | "black" | "draw" | "ongoing" = "ongoing";
  if (input.result === "1-0") gameResult = "white";
  else if (input.result === "0-1") gameResult = "black";
  else if (input.result === "1/2-1/2" || input.result === "½-½") gameResult = "draw";

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      white_player_id: user.id,
      black_player_id: user.id,
      result: gameResult,
      round: input.round,
      date_played: input.datePlayed,
      source_type: input.sourceType,
      source_file_url: input.sourceFileUrl,
      ocr_model_used: input.ocrModelUsed,
      notes: `Белые: ${input.whitePlayer}, Чёрные: ${input.blackPlayer}${input.tournament ? `, Турнир: ${input.tournament}` : ""}`,
      created_by: user.id,
    })
    .select()
    .single();

  if (gameError || !game) {
    logDbError("games.insert", gameError ?? {});
    return { error: gameError?.message || "Ошибка создания партии" };
  }

  if (movesWithFen.length > 0) {
    const { error: movesError } = await supabase.from("moves").insert(
      movesWithFen.map((m) => ({
        game_id: game.id,
        move_number: m.moveNumber,
        side: m.side,
        from_pit: m.pit,
        fen_after: m.fen,
      }))
    );

    if (movesError) {
      logDbError("games.moves_insert", movesError);
      return { error: `Ошибка сохранения ходов: ${movesError.message}` };
    }
  }

  return { gameId: game.id };
}

export async function getGames(): Promise<{ games: GameSummary[] } | { error: string; games: [] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован", games: [] };

  const pool = getPgPool();
  if (pool) {
    try {
      const rows = await gamesRepo.listGames(pool, user.id);
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

  const first = await supabase
    .from("games")
    .select(`
      id,
      created_at,
      notes,
      result,
      source_type,
      ocr_model_used,
      moves(count)
    `)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  let rows = first.data;
  if (first.error) {
    logDbError("games.list", first.error);
    const fallback = await supabase
      .from("games")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    if (fallback.error) {
      return { error: fallback.error.message, games: [] };
    }
    rows = fallback.data;
    const games = (rows || []).map((row) =>
      rowToGameSummary({ ...row, moves: [{ count: 0 }] } as never)
    );
    return { games };
  }

  const games = (rows || []).map((row) => rowToGameSummary(row as never));
  return { games };
}

export async function getGameById(id: string): Promise<{ game: StoredGame } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const pool = getPgPool();
  if (pool) {
    try {
      const game = await gamesRepo.getGameRow(pool, id, user.id);
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

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (gameError || !game) {
    logDbError("games.get", gameError ?? {});
    return { error: gameError?.message || "Партия не найдена" };
  }

  if (game.created_by !== user.id) {
    return { error: "Партия не найдена" };
  }

  const { data: moves, error: movesError } = await supabase
    .from("moves")
    .select("move_number, side, from_pit")
    .eq("game_id", id);

  if (movesError) {
    logDbError("games.moves", movesError);
    return { error: movesError.message };
  }

  return { game: buildStoredGameFromDb(game, moves || []) };
}

export async function deleteGame(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const pool = getPgPool();
  if (pool) {
    try {
      const ok = await gamesRepo.deleteGameRow(pool, id, user.id);
      if (!ok) return { error: "Партия не найдена" };
      return { success: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка БД";
      logDbError("games.pg.delete", { message: msg });
      return { error: msg };
    }
  }

  const { error } = await supabase
    .from("games")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    logDbError("games.delete", error);
    return { error: error.message };
  }
  return { success: true };
}
