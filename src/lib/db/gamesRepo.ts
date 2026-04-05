import type { Pool } from "pg";
import type { SaveGameInput } from "@/lib/games/types";

type MoveRow = {
  moveNumber: number;
  side: "white" | "black";
  pit: number;
  fen: string;
};

export async function saveGameTransaction(
  pool: Pool,
  userId: string,
  email: string,
  input: SaveGameInput,
  movesWithFen: MoveRow[]
): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO public.profiles (id, display_name, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         email = COALESCE(NULLIF(trim(EXCLUDED.email), ''), profiles.email)`,
      [userId, email || "", email || null]
    );

    let gameResult: "white" | "black" | "draw" | "ongoing" = "ongoing";
    if (input.result === "1-0") gameResult = "white";
    else if (input.result === "0-1") gameResult = "black";
    else if (input.result === "1/2-1/2" || input.result === "½-½") gameResult = "draw";

    const notes = `Белые: ${input.whitePlayer}, Чёрные: ${input.blackPlayer}${input.tournament ? `, Турнир: ${input.tournament}` : ""}`;

    const ins = await client.query<{ id: string }>(
      `INSERT INTO public.games (
        white_player_id, black_player_id, result, round, date_played,
        source_type, source_file_url, ocr_model_used, notes, created_by
      ) VALUES (
        $1, $2, $3::game_result, $4, $5,
        $6::game_source, $7, $8, $9, $10
      ) RETURNING id`,
      [
        userId,
        userId,
        gameResult,
        input.round ?? null,
        input.datePlayed ?? null,
        input.sourceType,
        input.sourceFileUrl ?? null,
        input.ocrModelUsed ?? null,
        notes,
        userId,
      ]
    );

    const gameId = ins.rows[0]?.id;
    if (!gameId) throw new Error("INSERT games не вернул id");

    for (const m of movesWithFen) {
      await client.query(
        `INSERT INTO public.moves (game_id, move_number, side, from_pit, fen_after)
         VALUES ($1, $2, $3::move_side, $4, $5)`,
        [gameId, m.moveNumber, m.side, m.pit, m.fen]
      );
    }

    await client.query("COMMIT");
    return gameId;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function listGames(pool: Pool, userId: string) {
  const res = await pool.query<{
    id: string;
    created_at: Date;
    notes: string | null;
    result: string;
    source_type: string;
    ocr_model_used: string | null;
    move_count: string | number;
  }>(
    `SELECT g.id, g.created_at, g.notes, g.result::text AS result, g.source_type::text AS source_type,
            g.ocr_model_used,
            (SELECT COUNT(*)::int FROM public.moves m WHERE m.game_id = g.id) AS move_count
     FROM public.games g
     WHERE g.created_by = $1
     ORDER BY g.created_at DESC`,
    [userId]
  );
  return res.rows;
}

export async function getGameRow(pool: Pool, gameId: string, userId: string) {
  const g = await pool.query(
    `SELECT id, created_at, notes, result::text AS result, source_type::text AS source_type,
            ocr_model_used, created_by
     FROM public.games WHERE id = $1 AND created_by = $2`,
    [gameId, userId]
  );
  return g.rows[0] ?? null;
}

export async function getMovesRows(pool: Pool, gameId: string) {
  const m = await pool.query<{ move_number: number; side: string; from_pit: number }>(
    `SELECT move_number, side::text AS side, from_pit FROM public.moves WHERE game_id = $1`,
    [gameId]
  );
  return m.rows;
}

export async function deleteGameRow(pool: Pool, gameId: string, userId: string): Promise<boolean> {
  const r = await pool.query(`DELETE FROM public.games WHERE id = $1 AND created_by = $2`, [gameId, userId]);
  return (r.rowCount ?? 0) > 0;
}
