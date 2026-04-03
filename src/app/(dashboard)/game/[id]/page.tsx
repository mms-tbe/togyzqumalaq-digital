"use client";

import { useEffect, useState, use } from "react";
import {
  Title,
  Stack,
  Paper,
  Group,
  Text,
  Badge,
  Table,
  Button,
  Loader,
  Center,
  CopyButton,
  ActionIcon,
  Tooltip,
  Code,
  Grid,
  Menu,
} from "@mantine/core";
import { IconCopy, IconCheck, IconDownload, IconArrowLeft } from "@tabler/icons-react";
import { getGameById } from "@/actions/games";
import { TogyzBoard } from "@/components/board/TogyzBoard";
import { BoardControls } from "@/components/board/BoardControls";
import { type PitIndex, type BoardState } from "@/lib/engine/types";
import { createInitialBoard, makeMove, boardToFen } from "@/lib/engine/TogyzEngine";
import { useRouter } from "next/navigation";

interface GameData {
  id: string;
  result: string;
  notes: string | null;
  source_type: string;
  created_at: string;
}

interface MoveData {
  move_number: number;
  side: string;
  from_pit: number;
  fen_after: string;
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<GameData | null>(null);
  const [moves, setMoves] = useState<MoveData[]>([]);
  const [boards, setBoards] = useState<BoardState[]>([]);
  const [fens, setFens] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, [id]);

  async function loadGame() {
    setLoading(true);
    const result = await getGameById(id);
    if (result.error || !result.game) {
      setLoading(false);
      return;
    }

    setGame(result.game as GameData);
    setMoves(result.moves as MoveData[]);

    // Replay moves to build board states
    const boardStates: BoardState[] = [];
    const fenList: string[] = [];
    let board = createInitialBoard();
    boardStates.push(board);
    fenList.push(boardToFen(board));

    for (const move of result.moves as MoveData[]) {
      const moveResult = makeMove(board, move.from_pit as PitIndex);
      if (moveResult) {
        board = moveResult.boardAfter;
        boardStates.push(board);
        fenList.push(moveResult.fen);
      }
    }

    setBoards(boardStates);
    setFens(fenList);
    setCurrentStep(0);
    setLoading(false);
  }

  function exportFen() {
    const content = fens.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game_${id}.fen.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    const data = {
      game,
      moves: moves.map((m) => ({
        moveNumber: m.move_number,
        side: m.side,
        pit: m.from_pit,
        fen: m.fen_after,
      })),
      fens,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game_${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (!game) {
    return <Text>Партия не найдена</Text>;
  }

  const currentBoard = boards[currentStep] || createInitialBoard();
  const currentFen = fens[currentStep] || "";

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
            <Button leftSection={<IconDownload size={16} />} variant="light">
              Экспорт
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={exportFen}>FEN (TXT)</Menu.Item>
            <Menu.Item onClick={exportJson}>JSON</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper p="md" withBorder>
            <Stack>
              <TogyzBoard board={currentBoard} />
              <BoardControls
                currentStep={currentStep}
                totalSteps={boards.length - 1}
                onStepChange={setCurrentStep}
              />
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed" mb="xs">
                {game.notes}
              </Text>
              <Group>
                <Badge>{game.source_type === "ocr" ? "OCR" : "Ручной ввод"}</Badge>
                <Badge color={
                  game.result === "white" ? "blue" :
                  game.result === "black" ? "red" :
                  game.result === "draw" ? "gray" : "yellow"
                }>
                  {game.result === "white" ? "1-0" :
                   game.result === "black" ? "0-1" :
                   game.result === "draw" ? "½-½" : "..."}
                </Badge>
              </Group>
            </Paper>

            <Paper p="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm">FEN</Text>
                <CopyButton value={currentFen}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Скопировано" : "Копировать"}>
                      <ActionIcon color={copied ? "teal" : "gray"} variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Code block>{currentFen}</Code>
            </Paper>

            <Paper p="md" withBorder>
              <Text fw={600} size="sm" mb="xs">Ходы</Text>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>Белые</Table.Th>
                    <Table.Th>Чёрные</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Array.from(
                    new Set(moves.map((m) => m.move_number))
                  ).map((num) => {
                    const w = moves.find(
                      (m) => m.move_number === num && m.side === "white"
                    );
                    const b = moves.find(
                      (m) => m.move_number === num && m.side === "black"
                    );
                    const wIdx = moves.indexOf(w!);
                    const bIdx = moves.indexOf(b!);
                    return (
                      <Table.Tr
                        key={num}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const stepIdx = wIdx >= 0 ? wIdx + 1 : bIdx + 1;
                          setCurrentStep(Math.min(stepIdx, boards.length - 1));
                        }}
                        bg={
                          (currentStep === wIdx + 1 || currentStep === bIdx + 1)
                            ? "var(--mantine-color-indigo-0)"
                            : undefined
                        }
                      >
                        <Table.Td>{num}</Table.Td>
                        <Table.Td>{w ? w.from_pit : ""}</Table.Td>
                        <Table.Td>{b ? b.from_pit : ""}</Table.Td>
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
