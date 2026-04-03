import { type PitIndex, type BoardState } from "./types";
import { createInitialBoard, makeMove, getGameResult, validateBoard } from "./TogyzEngine";

export interface ValidationResult {
  valid: boolean;
  errors: { index: number; message: string }[];
  boards: BoardState[];
  fens: string[];
  result: string;
}

/**
 * Validate a complete move sequence against togyzqumalaq rules.
 * Each move is a pit number 1-9 for the side whose turn it is.
 */
export function validateMoveSequence(moves: PitIndex[]): ValidationResult {
  const errors: { index: number; message: string }[] = [];
  const boards: BoardState[] = [];
  const fens: string[] = [];

  let board = createInitialBoard();
  boards.push(board);
  fens.push("9.9.9.9.9.9.9.9.9/0/9.9.9.9.9.9.9.9.9/0 w 1");

  for (let i = 0; i < moves.length; i++) {
    const pit = moves[i];

    if (pit < 1 || pit > 9) {
      errors.push({ index: i, message: `Некорректная лунка: ${pit}. Допустимы значения 1-9.` });
      continue;
    }

    const result = makeMove(board, pit);
    if (!result) {
      errors.push({ index: i, message: `Ход ${pit} невозможен на позиции хода #${i + 1}.` });
      continue;
    }

    board = result.boardAfter;
    boards.push(board);
    fens.push(result.fen);

    if (!validateBoard(board)) {
      errors.push({ index: i, message: `Нарушен инвариант 162 камня после хода #${i + 1}.` });
    }

    if (getGameResult(board) !== "ongoing") break;
  }

  return {
    valid: errors.length === 0,
    errors,
    boards,
    fens,
    result: getGameResult(board),
  };
}
