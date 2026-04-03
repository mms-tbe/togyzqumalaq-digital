export type Side = "white" | "black";
export type PitIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type GameResult = "white" | "black" | "draw" | "ongoing";

export interface BoardState {
  /** 18 pits: 0-8 = white, 9-17 = black. Value 255 = tuz marker */
  pits: number[];
  /** [white_kazan, black_kazan] */
  kazans: [number, number];
  /** [white_tuz_pit, black_tuz_pit] — 0 means none, 1-9 = opponent pit number */
  tuzPositions: [number, number];
  side: Side;
  moveNumber: number;
}

export interface MoveResult {
  from: PitIndex;
  landedAt: number;
  captured: number;
  tuzDeclared: boolean;
  boardAfter: BoardState;
  fen: string;
  notation: string;
}

export interface GameMove {
  moveNumber: number;
  side: Side;
  from: PitIndex;
  fen: string;
  notation: string;
}

export const TOTAL_STONES = 162;
export const TUZ_MARKER = 255;
export const WIN_THRESHOLD = 82;
