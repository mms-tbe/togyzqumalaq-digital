"use client";

import { type PgnMove } from "@/lib/engine/pgn";
import styles from "./TogyzBoard.module.css";

interface MoveListPanelProps {
  moves: PgnMove[];
  fen: string;
  pgn: string;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function MoveListPanel({ moves, fen, pgn, currentStep, onStepChange }: MoveListPanelProps) {
  return (
    <div>
      {/* Move list in playstrategy style */}
      <div className={styles.moveList}>
        {moves.map((m, idx) => {
          const whiteStep = idx * 2 + 1;
          const blackStep = idx * 2 + 2;
          return (
            <div
              key={m.moveNumber}
              className={`${styles.moveRow} ${currentStep === whiteStep || currentStep === blackStep ? styles.moveRowActive : ""}`}
            >
              <div className={styles.moveNum}>{m.moveNumber}</div>
              <div
                className={`${styles.moveCell} ${currentStep === whiteStep ? styles.moveCellActive : ""}`}
                onClick={() => onStepChange(whiteStep)}
              >
                {m.white}
              </div>
              <div
                className={`${styles.moveCell} ${currentStep === blackStep ? styles.moveCellActive : ""}`}
                onClick={() => m.black && onStepChange(blackStep)}
              >
                {m.black || ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* FEN */}
      <div className={styles.fenArea}>
        <span className={styles.fenLabel}>FEN</span>
        <div className={styles.fenValue}>{fen}</div>
      </div>

      {/* PGN */}
      <div className={styles.pgnArea}>
        <div className={styles.fenArea}>
          <span className={styles.fenLabel}>PGN</span>
        </div>
        <div className={styles.pgnValue}>{pgn}</div>
      </div>
    </div>
  );
}
