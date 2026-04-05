/** Вход для server action сохранения партии */
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

/** Партия для UI (просмотр / экспорт) — соответствует данным из Supabase после маппинга */
export interface StoredGame {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  tournament?: string;
  result: string;
  sourceType: "ocr" | "manual";
  moves: { moveNumber: number; side: "white" | "black"; notation: string }[];
  createdAt: string;
  notes?: string;
  ocrModelUsed?: string;
}

/** Список в архиве (без полного списка ходов) */
export interface GameSummary {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  tournament?: string;
  result: string;
  sourceType: "ocr" | "manual";
  createdAt: string;
  moveCount: number;
}
