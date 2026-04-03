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
} from "@mantine/core";
import { IconCopy, IconCheck, IconDownload, IconArrowLeft } from "@tabler/icons-react";
import { getGameByIdLocal, type StoredGame } from "@/lib/storage/games";
import { TogyzBoard } from "@/components/board/TogyzBoard";
import { BoardControls } from "@/components/board/BoardControls";
import { MoveListPanel } from "@/components/board/MoveListPanel";
import { type PitIndex, type BoardState } from "@/lib/engine/types";
import { createInitialBoard, makeMove, boardToFen } from "@/lib/engine/TogyzEngine";
import { generatePgn, toPgnMoves } from "@/lib/engine/pgn";
import { useRouter } from "next/navigation";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<StoredGame | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setGame(getGameByIdLocal(id));
  }, [id]);

  // Replay moves
  const replayData = useMemo(() => {
    if (!game) return { boards: [createInitialBoard()], notations: [] };
    const boards: BoardState[] = [createInitialBoard()];
    const notations: { notation: string; side: "white" | "black" }[] = [];
    let board = createInitialBoard();

    for (const move of game.moves) {
      const result = makeMove(board, move.pit as PitIndex);
      if (result) {
        board = result.boardAfter;
        boards.push(board);
        // Use stored notation if available, otherwise engine-generated
        notations.push({ notation: move.notation || result.notation, side: move.side });
      }
    }
    return { boards, notations };
  }, [game]);

  const viewBoard = replayData.boards[currentStep] || createInitialBoard();
  const currentFen = useMemo(() => boardToFen(viewBoard), [viewBoard]);
  const pgnMoves = useMemo(() => toPgnMoves(replayData.notations), [replayData.notations]);
  const pgnText = useMemo(
    () => generatePgn(replayData.notations, {
      white: game?.whitePlayer, black: game?.blackPlayer,
      event: game?.tournament, result: game?.result,
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

  function exportJson() {
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `game_${id}.json`;
    a.click();
  }

  function exportPgn() {
    const blob = new Blob([pgnText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `game_${id}.pgn`;
    a.click();
  }

  if (!game) {
    return (
      <Stack>
        <Text>Партия не найдена</Text>
        <Button onClick={() => router.push("/archive")}>К архиву</Button>
      </Stack>
    );
  }

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
            <BoardControls
              currentStep={currentStep}
              totalSteps={replayData.boards.length - 1}
              onStepChange={setCurrentStep}
            />
            <Paper p="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={600}>{game.whitePlayer} vs {game.blackPlayer}</Text>
                  {game.tournament && <Text size="xs" c="dimmed">{game.tournament}</Text>}
                </div>
                <Group>
                  <Badge>{game.sourceType === "ocr" ? "OCR" : "Ручной"}</Badge>
                  <Badge color={game.result === "1-0" || game.result === "white" ? "blue" : game.result === "0-1" || game.result === "black" ? "red" : "gray"}>
                    {game.result}
                  </Badge>
                </Group>
              </Group>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <MoveListPanel
            moves={pgnMoves}
            fen={currentFen}
            pgn={pgnText}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
