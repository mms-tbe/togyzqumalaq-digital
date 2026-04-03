"use client";

import { useState } from "react";
import {
  Title,
  Stack,
  Paper,
  Group,
  Button,
  TextInput,
  Select,
  Table,
  Badge,
  Grid,
  Text,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrash, IconPlayerTrackPrev } from "@tabler/icons-react";
import { TogyzBoard } from "@/components/board/TogyzBoard";
import { type PitIndex, type BoardState } from "@/lib/engine/types";
import { createInitialBoard, makeMove, getGameResult, boardToFen } from "@/lib/engine/TogyzEngine";
import { saveGame } from "@/actions/games";
import { useRouter } from "next/navigation";

interface RecordedMove {
  moveNumber: number;
  side: "white" | "black";
  pit: PitIndex;
}

export default function ManualPage() {
  const router = useRouter();
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [history, setHistory] = useState<BoardState[]>([createInitialBoard()]);
  const [moves, setMoves] = useState<RecordedMove[]>([]);
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [tournament, setTournament] = useState("");
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handlePitClick(pit: number) {
    if (getGameResult(board) !== "ongoing") return;

    const result = makeMove(board, pit as PitIndex);
    if (!result) {
      notifications.show({ message: `Ход ${pit} невозможен`, color: "red" });
      return;
    }

    const moveNumber = result.boardAfter.side === "white"
      ? board.moveNumber
      : board.moveNumber;

    setMoves((prev) => [
      ...prev,
      {
        moveNumber: board.moveNumber,
        side: board.side,
        pit: pit as PitIndex,
      },
    ]);
    setHistory((prev) => [...prev, result.boardAfter]);
    setBoard(result.boardAfter);
  }

  function handleUndo() {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const newMoves = moves.slice(0, -1);
    setHistory(newHistory);
    setMoves(newMoves);
    setBoard(newHistory[newHistory.length - 1]);
  }

  function handleReset() {
    const initial = createInitialBoard();
    setBoard(initial);
    setHistory([initial]);
    setMoves([]);
  }

  async function handleSave() {
    setSaving(true);
    const result = await saveGame({
      whitePlayer: whitePlayer || "Белые",
      blackPlayer: blackPlayer || "Чёрные",
      tournament: tournament || undefined,
      result: gameResult || getGameResult(board) === "ongoing" ? "ongoing" : gameResult || "ongoing",
      sourceType: "manual",
      moves: moves.map((m) => ({
        moveNumber: m.moveNumber,
        side: m.side,
        pit: m.pit,
      })),
    });

    setSaving(false);
    if (result.error) {
      notifications.show({ message: result.error, color: "red" });
      return;
    }

    notifications.show({ message: "Партия сохранена!", color: "green" });
    router.push(`/game/${result.gameId}`);
  }

  const result = getGameResult(board);

  return (
    <Stack>
      <Title order={2}>Ручной ввод партии</Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper p="md" withBorder>
            <Stack>
              <TogyzBoard
                board={board}
                onPitClick={handlePitClick}
                interactive={result === "ongoing"}
              />

              {result !== "ongoing" && (
                <Badge size="lg" color={result === "draw" ? "gray" : result === "white" ? "blue" : "red"}>
                  {result === "white" ? "Белые победили (1-0)" :
                   result === "black" ? "Чёрные победили (0-1)" :
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

              <Text size="sm" c="dimmed">
                Нажмите на лунку (1-9) текущего игрока для хода.
                Ход: {board.side === "white" ? "Белые" : "Чёрные"}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>
            <Paper p="md" withBorder>
              <Stack>
                <TextInput
                  label="Белые (Бастаушы)"
                  value={whitePlayer}
                  onChange={(e) => setWhitePlayer(e.target.value)}
                />
                <TextInput
                  label="Чёрные (Қостаушы)"
                  value={blackPlayer}
                  onChange={(e) => setBlackPlayer(e.target.value)}
                />
                <TextInput
                  label="Турнир"
                  value={tournament}
                  onChange={(e) => setTournament(e.target.value)}
                />
                <Select
                  label="Результат"
                  value={gameResult}
                  onChange={setGameResult}
                  data={[
                    { value: "1-0", label: "1-0 (Белые)" },
                    { value: "0-1", label: "0-1 (Чёрные)" },
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

            <Paper p="md" withBorder>
              <Text fw={600} size="sm" mb="xs">
                Записанные ходы ({moves.length})
              </Text>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>Белые</Table.Th>
                    <Table.Th>Чёрные</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Array.from(
                    new Set(moves.map((m) => m.moveNumber))
                  ).map((num) => {
                    const w = moves.find(
                      (m) => m.moveNumber === num && m.side === "white"
                    );
                    const b = moves.find(
                      (m) => m.moveNumber === num && m.side === "black"
                    );
                    return (
                      <Table.Tr key={num}>
                        <Table.Td>{num}</Table.Td>
                        <Table.Td>{w?.pit || ""}</Table.Td>
                        <Table.Td>{b?.pit || ""}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
