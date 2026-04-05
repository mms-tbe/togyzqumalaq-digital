"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import { logDbError, logDebug } from "@/lib/logger";
import { type PitIndex } from "@/lib/engine/types";
import { createInitialBoard, makeMove } from "@/lib/engine/TogyzEngine";

export interface SaveGameInput {
  whitePlayer: string;
  blackPlayer: string;
  tournament?: string;
  round?: number;
  datePlayed?: string;
  result: string;
  sourceType: "ocr" | "manual";
  sourceFileUrl?: string;
  ocrModelUsed?: string;
  moves: { moveNumber: number; side: "white" | "black"; notation: string }[];
}

export async function saveGame(input: SaveGameInput) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = await getServerDb();
  logDebug("games.save", "using_db", { serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY });

  await db.from("profiles").upsert(
    { id: user.id, display_name: user.email || "" },
    { onConflict: "id", ignoreDuplicates: true }
  );

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

  let gameResult: "white" | "black" | "draw" | "ongoing" = "ongoing";
  if (input.result === "1-0") gameResult = "white";
  else if (input.result === "0-1") gameResult = "black";
  else if (input.result === "1/2-1/2" || input.result === "½-½") gameResult = "draw";

  const { data: game, error: gameError } = await db
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
    const { error: movesError } = await db.from("moves").insert(
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

export async function getGames() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: "Не авторизован", games: [] };

  const db = await getServerDb();
  const { data, error } = await db
    .from("games")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    logDbError("games.list", error);
    return { error: error.message, games: [] };
  }
  return { games: data || [] };
}

export async function getGameById(id: string) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = await getServerDb();
  const { data: game, error: gameError } = await db
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

  const { data: moves, error: movesError } = await db
    .from("moves")
    .select("*")
    .eq("game_id", id)
    .order("move_number", { ascending: true })
    .order("side", { ascending: true });

  if (movesError) {
    logDbError("games.moves", movesError);
    return { error: movesError.message };
  }

  return { game, moves: moves || [] };
}

export async function deleteGame(id: string) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = await getServerDb();
  const { error } = await db
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
