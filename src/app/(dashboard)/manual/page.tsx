"use client";

import { useState, useMemo } from "react";
import {
  Title,
  Stack,
  Paper,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Grid,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlayerTrackPrev } from "@tabler/icons-react";
import { TogyzBoard } from "@/components/board/TogyzBoard";
import { MoveListPanel } from "@/components/board/MoveListPanel";
import { BoardControls } from "@/components/board/BoardControls";
import { type PitIndex, type BoardState } from "@/lib/engine/types";
import { createInitialBoard, makeMove, getGameResult, boardToFen } from "@/lib/engine/TogyzEngine";
import { generatePgn, toPgnMoves } from "@/lib/engine/pgn";
import { saveGameLocal } from "@/lib/storage/games";
import { useRouter } from "next/navigation";

interface RecordedMove {
  moveNumber: number;
  side: "white" | "black";
  pit: PitIndex;
  notation: string;
}

export default function ManualPage() {
  const router = useRouter();
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [history, setHistory] = useState<BoardState[]>([createInitialBoard()]);
  const [moves, setMoves] = useState<RecordedMove[]>([]);
  const [viewStep, setViewStep] = useState(0); // 0 = initial, moves.length = latest
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [tournament, setTournament] = useState("");
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Current board for viewing (can be historical)
  const viewBoard = history[viewStep] || board;
  const isLatest = viewStep === history.length - 1;

  // PGN moves for display
  const pgnMoves = useMemo(() => toPgnMoves(moves), [moves]);

  // Current FEN
  const currentFen = useMemo(() => boardToFen(viewBoard), [viewBoard]);

  // Full PGN text
  const pgnText = useMemo(
    () =>
      generatePgn(moves, {
        white: whitePlayer || "Бастаушы",
        black: blackPlayer || "Қостаушы",
        event: tournament || undefined,
        result: gameResult || undefined,
      }),
    [moves, whitePlayer, blackPlayer, tournament, gameResult]
  );

  function handlePitClick(pit: number) {
    // Only allow moves when viewing the latest position
    if (!isLatest) {
      // Jump to latest first
      setViewStep(history.length - 1);
      return;
    }

    if (getGameResult(board) !== "ongoing") return;

    const result = makeMove(board, pit as PitIndex);
    if (!result) {
      notifications.show({ message: `Ход ${pit} невозможен`, color: "red" });
      return;
    }

    setMoves((prev) => [
      ...prev,
      {
        moveNumber: board.moveNumber,
        side: board.side,
        pit: pit as PitIndex,
        notation: result.notation,
      },
    ]);
    setHistory((prev) => [...prev, result.boardAfter]);
    setBoard(result.boardAfter);
    setViewStep(history.length); // Will be new length - 1 after state update
  }

  function handleUndo() {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const newMoves = moves.slice(0, -1);
    setHistory(newHistory);
    setMoves(newMoves);
    const newBoard = newHistory[newHistory.length - 1];
    setBoard(newBoard);
    setViewStep(newHistory.length - 1);
  }

  function handleReset() {
    const initial = createInitialBoard();
    setBoard(initial);
    setHistory([initial]);
    setMoves([]);
    setViewStep(0);
  }

  function handleStepChange(step: number) {
    setViewStep(Math.max(0, Math.min(step, history.length - 1)));
  }

  function handleSave() {
    setSaving(true);
    try {
      const gameId = saveGameLocal({
        whitePlayer: whitePlayer || "Бастаушы",
        blackPlayer: blackPlayer || "Қостаушы",
        tournament: tournament || undefined,
        result: gameResult || (getGameResult(board) !== "ongoing" ? getGameResult(board) : "ongoing"),
        sourceType: "manual",
        moves: moves.map((m) => ({
          moveNumber: m.moveNumber,
          side: m.side,
          notation: m.notation,
        })),
      });

      notifications.show({ message: "Партия сохранена!", color: "green" });
      router.push(`/game/${gameId}`);
    } catch (err) {
      notifications.show({ message: "Ошибка сохранения", color: "red" });
    } finally {
      setSaving(false);
    }
  }

  const result = getGameResult(board);

  return (
    <Stack>
      <Title order={2}>Ручной ввод партии</Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack>
            <TogyzBoard
              board={viewBoard}
              onPitClick={handlePitClick}
              interactive={result === "ongoing" && isLatest}
            />

            <BoardControls
              currentStep={viewStep}
              totalSteps={history.length - 1}
              onStepChange={handleStepChange}
            />

            {result !== "ongoing" && (
              <Badge size="lg" color={result === "draw" ? "gray" : result === "white" ? "blue" : "red"}>
                {result === "white" ? "Бастаушы победил (1-0)" :
                 result === "black" ? "Қостаушы победил (0-1)" :
                 "Ничья (½-½)"}
              </Badge>
            )}

            <Group>
              <Button
                variant="light"
                leftSection={<IconPlayerTrackPrev size={16} />}
                onClick={handleUndo}
                disabled={history.length <= 1}
              >
                Отменить ход
              </Button>
              <Button variant="light" color="red" onClick={handleReset}>
                Сбросить
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>
            {/* Move list + FEN + PGN */}
            <MoveListPanel
              moves={pgnMoves}
              fen={currentFen}
              pgn={pgnText}
              currentStep={viewStep}
              onStepChange={handleStepChange}
            />

            {/* Game metadata */}
            <Paper p="md" withBorder>
              <Stack>
                <TextInput
                  label="Бастаушы (Белые)"
                  value={whitePlayer}
                  onChange={(e) => setWhitePlayer(e.target.value)}
                  placeholder="Имя игрока"
                />
                <TextInput
                  label="Қостаушы (Чёрные)"
                  value={blackPlayer}
                  onChange={(e) => setBlackPlayer(e.target.value)}
                  placeholder="Имя игрока"
                />
                <TextInput
                  label="Турнир"
                  value={tournament}
                  onChange={(e) => setTournament(e.target.value)}
                  placeholder="Название турнира"
                />
                <Select
                  label="Результат"
                  value={gameResult}
                  onChange={setGameResult}
                  data={[
                    { value: "1-0", label: "1-0 (Бастаушы)" },
                    { value: "0-1", label: "0-1 (Қостаушы)" },
                    { value: "1/2-1/2", label: "½-½ (Ничья)" },
                  ]}
                  clearable
                />
                <Button
                  leftSection={<IconCheck size={16} />}
                  onClick={handleSave}
                  loading={saving}
                  disabled={moves.length === 0}
                >
                  Сохранить партию
                </Button>
              </Stack>
            </Paper>

            <Text size="xs" c="dimmed">
              Нажмите на лунку текущего игрока для хода. Используйте навигацию для просмотра позиций.
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
