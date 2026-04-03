"use client";

import { type BoardState, TUZ_MARKER } from "@/lib/engine/types";
import styles from "./TogyzBoard.module.css";

interface TogyzBoardProps {
  board: BoardState;
  onPitClick?: (pit: number) => void;
  interactive?: boolean;
}

/** Render individual stones as 3D spheres, max ~20 visible */
function Stones({ count }: { count: number }) {
  if (count === 0) return null;
  const visible = Math.min(count, 20);
  // Arrange in columns of 3
  const cols = Math.min(3, visible);
  const rows = Math.ceil(visible / cols);

  return (
    <div className={styles.stonesGrid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: visible }, (_, i) => (
        <div key={i} className={styles.stone} />
      ))}
    </div>
  );
}

/** Count badge shown between rows */
function CountBadge({ count, isTuz, isActive, onClick }: {
  count: number;
  isTuz: boolean;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`${styles.countBadge} ${isTuz ? styles.tuzBadge : ""} ${isActive ? styles.activeBadge : ""}`}
      onClick={isActive ? onClick : undefined}
    >
      {isTuz ? "X" : count}
    </div>
  );
}

/** Kazan score bar */
function KazanBar({ value, label, side }: { value: number; label: string; side: "top" | "bottom" }) {
  const pct = Math.min((value / 82) * 100, 100);
  return (
    <div className={`${styles.kazanBar} ${side === "top" ? styles.kazanTop : styles.kazanBottom}`}>
      <div className={styles.kazanFill} style={{ width: `${pct}%` }} />
      <span className={styles.kazanScore}>{value}</span>
      <span className={styles.kazanLabel}>{label}</span>
    </div>
  );
}

export function TogyzBoard({ board, onPitClick, interactive }: TogyzBoardProps) {
  const isWhiteTurn = board.side === "white";

  return (
    <div className={styles.wrapper}>
      {/* Black kazan */}
      <KazanBar value={board.kazans[1]} label="Қостаушы" side="top" />

      {/* Player label top */}
      <div className={styles.playerLabel}>Қостаушы</div>

      {/* Board */}
      <div className={styles.board}>
        {/* Pit numbers top (black: 9 to 1) */}
        <div className={styles.pitNumbers}>
          {Array.from({ length: 9 }, (_, i) => 9 - i).map((n) => (
            <span key={n} className={styles.pitNumber}>{n}</span>
          ))}
        </div>

        {/* Black pits (top row) */}
        <div className={styles.pitsRow}>
          {Array.from({ length: 9 }, (_, i) => 17 - i).map((idx) => {
            const isTuz = board.pits[idx] === TUZ_MARKER;
            const stoneCount = isTuz ? 0 : board.pits[idx];
            return (
              <div
                key={`b-${idx}`}
                className={`${styles.pit} ${isTuz ? styles.tuzPit : ""} ${interactive && !isWhiteTurn ? styles.clickable : ""}`}
                onClick={interactive && !isWhiteTurn ? () => onPitClick?.(idx - 8) : undefined}
              >
                <Stones count={stoneCount} />
                {isTuz && <div className={styles.tuzMarker}>TUZ</div>}
              </div>
            );
          })}
        </div>

        {/* Count badges row - black */}
        <div className={styles.badgesRow}>
          {Array.from({ length: 9 }, (_, i) => 17 - i).map((idx) => (
            <CountBadge
              key={`cb-${idx}`}
              count={board.pits[idx] === TUZ_MARKER ? 0 : board.pits[idx]}
              isTuz={board.pits[idx] === TUZ_MARKER}
              isActive={interactive === true && !isWhiteTurn}
              onClick={() => onPitClick?.(idx - 8)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Count badges row - white */}
        <div className={styles.badgesRow}>
          {Array.from({ length: 9 }, (_, i) => i).map((idx) => (
            <CountBadge
              key={`cw-${idx}`}
              count={board.pits[idx] === TUZ_MARKER ? 0 : board.pits[idx]}
              isTuz={board.pits[idx] === TUZ_MARKER}
              isActive={interactive === true && isWhiteTurn}
              onClick={() => onPitClick?.(idx + 1)}
            />
          ))}
        </div>

        {/* White pits (bottom row) */}
        <div className={styles.pitsRow}>
          {Array.from({ length: 9 }, (_, i) => i).map((idx) => {
            const isTuz = board.pits[idx] === TUZ_MARKER;
            const stoneCount = isTuz ? 0 : board.pits[idx];
            return (
              <div
                key={`w-${idx}`}
                className={`${styles.pit} ${isTuz ? styles.tuzPit : ""} ${interactive && isWhiteTurn ? styles.clickable : ""}`}
                onClick={interactive && isWhiteTurn ? () => onPitClick?.(idx + 1) : undefined}
              >
                <Stones count={stoneCount} />
                {isTuz && <div className={styles.tuzMarker}>TUZ</div>}
              </div>
            );
          })}
        </div>

        {/* Pit numbers bottom (white: 1 to 9) */}
        <div className={styles.pitNumbers}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <span key={n} className={styles.pitNumber}>{n}</span>
          ))}
        </div>
      </div>

      {/* Player label bottom */}
      <div className={styles.playerLabel}>Бастаушы</div>

      {/* White kazan */}
      <KazanBar value={board.kazans[0]} label="Бастаушы" side="bottom" />

      {/* Turn indicator */}
      <div className={styles.turnIndicator}>
        Ход {board.moveNumber}: {isWhiteTurn ? "Бастаушы (Белые)" : "Қостаушы (Чёрные)"}
      </div>
    </div>
  );
}
