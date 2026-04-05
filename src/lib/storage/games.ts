/**
 * Локальное хранение партий (localStorage) для офлайн / без БД.
 *
 * Если PostgREST отдаёт JWT с пустым `role` и падает с `role "" does not exist`,
 * на сервере задайте `SUPABASE_SERVICE_ROLE_KEY` и используйте `src/actions/games.ts`
 * (`getServerDb()`), а не anon-клиент без сессии.
 */

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

const STORAGE_KEY = "togyz_games";

function getGamesFromStorage(): StoredGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGamesToStorage(games: StoredGame[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function saveGameLocal(input: Omit<StoredGame, "id" | "createdAt">): string {
  const id = crypto.randomUUID();
  const game: StoredGame = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  const games = getGamesFromStorage();
  games.unshift(game);
  saveGamesToStorage(games);
  return id;
}

export function getGamesLocal(): StoredGame[] {
  return getGamesFromStorage();
}

export function getGameByIdLocal(id: string): StoredGame | null {
  const games = getGamesFromStorage();
  return games.find((g) => g.id === id) || null;
}

export function deleteGameLocal(id: string): boolean {
  const games = getGamesFromStorage();
  const filtered = games.filter((g) => g.id !== id);
  saveGamesToStorage(filtered);
  return filtered.length < games.length;
}
