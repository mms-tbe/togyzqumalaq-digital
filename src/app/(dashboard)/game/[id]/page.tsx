"use client";

import { useEffect, useState, useMemo, use } from "react";
import {
  Title,
  Stack,
  Paper,
  Group,
  Text,
  Badge,
  Button,
  Code,
  Grid,
  Menu,
  ActionIcon,
  Tooltip,
  CopyButton,
  Loader,
  Center,
} from "@mantine/core";
import { IconCopy, IconCheck, IconDownload, IconArrowLeft } from "@tabler/icons-react";
import { getGameById } from "@/actions/games";
import { TogyzBoard } from "@/components/board/TogyzBoard";
import { BoardControls } from "@/components/board/BoardControls";
import { MoveListPanel } from "@/components/board/MoveListPanel";
import { type PitIndex, type BoardState } from "@/lib/engine/types";
import { createInitialBoard, makeMove, boardToFen } from "@/lib/engine/TogyzEngine";
import { generatePgn, toPgnMoves } from "@/lib/engine/pgn";
import { useRouter } from "next/navigation";

interface MoveRow {
  move_number: number;
  side: string;
  from_pit: number;
  fen_after: string;
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<Record<string, unknown> | null>(null);
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGame();
  }, [id]);

  async function loadGame() {
    setLoading(true);
    const result = await getGameById(id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setGame(result.game as Record<string, unknown>);
    setMoves((result.moves || []) as MoveRow[]);
    setLoading(false);
  }

  // Replay moves
  const replayData = useMemo(() => {
    const boards: BoardState[] = [createInitialBoard()];
    const notations: { notation: string; side: "white" | "black" }[] = [];
    let board = createInitialBoard();

    for (const move of moves) {
      const result = makeMove(board, move.from_pit as PitIndex);
      if (result) {
        board = result.boardAfter;
        boards.push(board);
        notations.push({ notation: result.notation, side: move.side as "white" | "black" });
      }
    }
    return { boards, notations };
  }, [moves]);

  const viewBoard = replayData.boards[currentStep] || createInitialBoard();
  const currentFen = useMemo(() => boardToFen(viewBoard), [viewBoard]);
  const pgnMoves = useMemo(() => toPgnMoves(replayData.notations), [replayData.notations]);
  const pgnText = useMemo(
    () => generatePgn(replayData.notations, {
      white: (game?.notes as string)?.match(/Белые: ([^,]+)/)?.[1] || "Бастаушы",
      black: (game?.notes as string)?.match(/Чёрные: ([^,]+)/)?.[1] || "Қостаушы",
      result: game?.result as string,
    }),
    [replayData.notations, game]
  );

  function exportFen() {
    const fens = replayData.boards.map((b) => boardToFen(b));
    const blob = new Blob([fens.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `game_${id}.fen.txt`;
    a.click();
  }

  function exportPgn() {
    const blob = new Blob([pgnText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `game_${id}.pgn`;
    a.click();
  }

  function exportJson() {
    const data = {
      game,
      moves: replayData.notations.map((n, i) => ({
        moveNumber: moves[i]?.move_number,
        side: n.side,
        notation: n.notation,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `game_${id}.json`;
    a.click();
  }

  if (loading) return <Center h={300}><Loader /></Center>;
  if (error || !game) return (
    <Stack><Text c="red">{error || "Партия не найдена"}</Text>
      <Button onClick={() => router.push("/archive")}>К архиву</Button>
    </Stack>
  );

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="default" onClick={() => router.push("/archive")}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={2}>Просмотр партии</Title>
        </Group>
        <Menu shadow="md">
          <Menu.Target>
            <Button leftSection={<IconDownload size={16} />} variant="light">Экспорт</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={exportFen}>FEN (TXT)</Menu.Item>
            <Menu.Item onClick={exportPgn}>PGN</Menu.Item>
            <Menu.Item onClick={exportJson}>JSON</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack>
            <TogyzBoard board={viewBoard} />
            <BoardControls currentStep={currentStep} totalSteps={replayData.boards.length - 1} onStepChange={setCurrentStep} />
            <Paper p="md" withBorder>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">{game.notes as string}</Text>
                <Group>
                  <Badge>{game.source_type === "ocr" ? "OCR" : "Ручной"}</Badge>
                  <Badge color={game.result === "white" ? "blue" : game.result === "black" ? "red" : "gray"}>
                    {game.result === "white" ? "1-0" : game.result === "black" ? "0-1" : game.result === "draw" ? "½-½" : "..."}
                  </Badge>
                </Group>
              </Group>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <MoveListPanel moves={pgnMoves} fen={currentFen} pgn={pgnText} currentStep={currentStep} onStepChange={setCurrentStep} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
