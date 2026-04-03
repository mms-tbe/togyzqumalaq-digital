/**
 * Togyzqumalaq game engine — pure TypeScript, zero dependencies.
 * Ported from yernarsha-togyz_js togyz.js
 */
import {
  type BoardState,
  type MoveResult,
  type Side,
  type PitIndex,
  type GameResult,
  TOTAL_STONES,
  TUZ_MARKER,
  WIN_THRESHOLD,
} from "./types";

export function createInitialBoard(): BoardState {
  const pits = new Array(18).fill(9);
  return {
    pits,
    kazans: [0, 0],
    tuzPositions: [0, 0],
    side: "white",
    moveNumber: 1,
  };
}

function cloneBoard(board: BoardState): BoardState {
  return {
    pits: [...board.pits],
    kazans: [...board.kazans],
    tuzPositions: [...board.tuzPositions],
    side: board.side,
    moveNumber: board.moveNumber,
  };
}

/** Convert player-relative pit (1-9) to absolute index (0-17) */
function toAbsIndex(pit: PitIndex, side: Side): number {
  return side === "white" ? pit - 1 : pit - 1 + 9;
}

/** Get valid moves for the current side */
export function getValidMoves(board: BoardState): PitIndex[] {
  const moves: PitIndex[] = [];
  for (let p = 1; p <= 9; p++) {
    const idx = toAbsIndex(p as PitIndex, board.side);
    if (board.pits[idx] > 0 && board.pits[idx] !== TUZ_MARKER) {
      moves.push(p as PitIndex);
    }
  }
  return moves;
}

/** Execute a move. Returns null if invalid. */
export function makeMove(board: BoardState, pit: PitIndex): MoveResult | null {
  const absIndex = toAbsIndex(pit, board.side);
  const stones = board.pits[absIndex];

  if (stones === 0 || stones === TUZ_MARKER) return null;

  const b = cloneBoard(board);
  const color = b.side === "white" ? 0 : 1;
  let capturedTuz = false;

  // Pick up stones
  let sow: number;
  if (stones === 1) {
    b.pits[absIndex] = 0;
    sow = 1;
  } else {
    b.pits[absIndex] = 1;
    sow = stones - 1;
  }

  // Sow counterclockwise
  let current = absIndex;
  for (let i = 0; i < sow; i++) {
    current++;
    if (current > 17) current = 0;
    if (b.pits[current] === TUZ_MARKER) {
      // Stone goes to tuz owner's kazan
      if (current > 8) b.kazans[0]++; // white's tuz is on black's side (9-17)
      else b.kazans[1]++; // black's tuz is on white's side (0-8)
    } else {
      b.pits[current]++;
    }
  }

  // Check tuz capture (exactly 3 stones)
  if (b.pits[current] === 3) {
    if (
      color === 0 &&
      b.tuzPositions[0] === 0 &&
      current > 8 &&
      current < 17 &&
      b.tuzPositions[1] !== current - 8
    ) {
      b.kazans[0] += 3;
      b.pits[current] = TUZ_MARKER;
      b.tuzPositions[0] = current - 8;
      capturedTuz = true;
    } else if (
      color === 1 &&
      b.tuzPositions[1] === 0 &&
      current < 8 &&
      b.tuzPositions[0] !== current + 1
    ) {
      b.kazans[1] += 3;
      b.pits[current] = TUZ_MARKER;
      b.tuzPositions[1] = current + 1;
      capturedTuz = true;
    }
  }

  // Check even capture
  let evenCaptured = 0;
  if (b.pits[current] !== TUZ_MARKER && b.pits[current] % 2 === 0) {
    if (color === 0 && current > 8) {
      evenCaptured = b.pits[current];
      b.kazans[0] += b.pits[current];
      b.pits[current] = 0;
    } else if (color === 1 && current < 9) {
      evenCaptured = b.pits[current];
      b.kazans[1] += b.pits[current];
      b.pits[current] = 0;
    }
  }

  // Switch side
  b.side = b.side === "white" ? "black" : "white";
  if (b.side === "white") b.moveNumber++;

  // Check position (empty side)
  checkPosition(b);

  // Build notation (playstrategy format: "76(10)" or "77X")
  const landedPit =
    current > 8 ? current - 9 + 1 : current + 1;
  let notation = `${pit}${landedPit}`;
  if (capturedTuz) {
    notation += "X";
  } else if (evenCaptured > 0) {
    notation += `(${evenCaptured})`;
  }

  const totalCaptured = capturedTuz ? 3 : evenCaptured;
  const fen = boardToFen(b);

  return {
    from: pit,
    landedAt: current,
    captured: totalCaptured,
    tuzDeclared: capturedTuz,
    boardAfter: b,
    fen,
    notation,
  };
}

function checkPosition(b: BoardState): void {
  const color = b.side === "white" ? 0 : 1;

  let whiteStones = 0;
  for (let i = 0; i < 9; i++) {
    if (b.pits[i] !== TUZ_MARKER) whiteStones += b.pits[i];
  }

  let blackStones = 0;
  for (let i = 9; i < 18; i++) {
    if (b.pits[i] !== TUZ_MARKER) blackStones += b.pits[i];
  }

  // If current side has no stones, opponent collects remaining
  if (color === 0 && whiteStones === 0) {
    b.kazans[1] += blackStones;
    for (let i = 9; i < 18; i++) {
      if (b.pits[i] !== TUZ_MARKER) b.pits[i] = 0;
    }
  } else if (color === 1 && blackStones === 0) {
    b.kazans[0] += whiteStones;
    for (let i = 0; i < 9; i++) {
      if (b.pits[i] !== TUZ_MARKER) b.pits[i] = 0;
    }
  }
}

export function getGameResult(board: BoardState): GameResult {
  if (board.kazans[0] >= WIN_THRESHOLD) return "white";
  if (board.kazans[1] >= WIN_THRESHOLD) return "black";
  if (board.kazans[0] === 81 && board.kazans[1] === 81) return "draw";
  return "ongoing";
}

/**
 * FEN in playstrategy format:
 * [P2 pits 9→1]/[P1 pits 1→9] P1score P2score Turn MoveNum
 * Each pit: "9S" or "t" for tuz. Example:
 * 9S,9S,9S,9S,9S,9S,9S,9S,9S/9S,9S,9S,9S,9S,9S,9S,9S,9S 0 0 S 1
 */
export function boardToFen(board: BoardState): string {
  // P2 pits: indices 17→9 (pit 9 to pit 1, displayed left to right on top)
  const p2Pits = [];
  for (let i = 17; i >= 9; i--) {
    p2Pits.push(board.pits[i] === TUZ_MARKER ? "t" : `${board.pits[i]}S`);
  }
  // P1 pits: indices 0→8 (pit 1 to pit 9, displayed left to right on bottom)
  const p1Pits = [];
  for (let i = 0; i <= 8; i++) {
    p1Pits.push(board.pits[i] === TUZ_MARKER ? "t" : `${board.pits[i]}S`);
  }
  const side = board.side === "white" ? "S" : "N";
  return `${p2Pits.join(",")}/${p1Pits.join(",")} ${board.kazans[0]} ${board.kazans[1]} ${side} ${board.moveNumber}`;
}

/** Simple FEN for internal storage (backward compat) */
export function boardToSimpleFen(board: BoardState): string {
  const whitePits = board.pits.slice(0, 9).map((v) => (v === TUZ_MARKER ? 0 : v)).join(".");
  const blackPits = board.pits.slice(9, 18).map((v) => (v === TUZ_MARKER ? 0 : v)).join(".");
  const side = board.side === "white" ? "w" : "b";
  return `${whitePits}/${board.kazans[0]}/${blackPits}/${board.kazans[1]} ${side} ${board.moveNumber}`;
}

export function fenToBoard(fen: string): BoardState | null {
  try {
    const [position, sideChar, moveStr] = fen.split(" ");
    const parts = position.split("/");
    if (parts.length !== 4) return null;

    const whitePits = parts[0].split(".").map(Number);
    const whiteKazan = parseInt(parts[1]);
    const blackPits = parts[2].split(".").map(Number);
    const blackKazan = parseInt(parts[3]);

    if (whitePits.length !== 9 || blackPits.length !== 9) return null;

    const pits = [...whitePits, ...blackPits];

    // Detect tuz positions (pits with 0 that should be TUZ_MARKER)
    // We can't fully reconstruct tuz from FEN alone without extra fields
    // For now, return without tuz markers
    return {
      pits,
      kazans: [whiteKazan, blackKazan],
      tuzPositions: [0, 0],
      side: sideChar === "w" ? "white" : "black",
      moveNumber: parseInt(moveStr) || 1,
    };
  } catch {
    return null;
  }
}

/** Validate stone count invariant */
export function validateBoard(board: BoardState): boolean {
  let total = board.kazans[0] + board.kazans[1];
  for (let i = 0; i < 18; i++) {
    if (board.pits[i] !== TUZ_MARKER) total += board.pits[i];
  }
  return total === TOTAL_STONES;
}

/** Replay a sequence of moves from initial position */
export function replayMoves(moves: PitIndex[]): {
  boards: BoardState[];
  fens: string[];
  error?: { index: number; pit: PitIndex };
} {
  const boards: BoardState[] = [];
  const fens: string[] = [];
  let board = createInitialBoard();
  boards.push(board);
  fens.push(boardToFen(board));

  for (let i = 0; i < moves.length; i++) {
    const result = makeMove(board, moves[i]);
    if (!result) {
      return { boards, fens, error: { index: i, pit: moves[i] } };
    }
    board = result.boardAfter;
    boards.push(board);
    fens.push(result.fen);
  }

  return { boards, fens };
}
