"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Title,
  Stepper,
  Stack,
  Paper,
  Group,
  Image,
  Text,
  Progress,
  Button,
  Table,
  TextInput,
  Select,
  Alert,
  Badge,
  ScrollArea,
  Grid,
  ActionIcon,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { processOcrDirect } from "@/actions/ocr";
import { saveGameLocal } from "@/lib/storage/games";
import { parseOcrResponse, type OcrResult, type OcrMove } from "@/lib/ocr/parser";
import { type PitIndex } from "@/lib/engine/types";
import { createInitialBoard, makeMove, getGameResult, boardToFen } from "@/lib/engine/TogyzEngine";
import { TogyzBoard } from "@/components/board/TogyzBoard";
import { MoveListPanel } from "@/components/board/MoveListPanel";
import { BoardControls } from "@/components/board/BoardControls";
import { generatePgn, toPgnMoves } from "@/lib/engine/pgn";
import { useRouter } from "next/navigation";

/** Resize image to max dimension and return base64 (JPEG quality 0.85) */
function resizeAndBase64(file: File, maxDim = 1024): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mime: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Metadata
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [tournament, setTournament] = useState("");
  const [gameResult, setGameResult] = useState<string | null>(null);

  // Editable moves — fixed 80 rows, notation strings
  const defaultMoves: OcrMove[] = Array.from({ length: 80 }, (_, i) => ({ n: i + 1, w: "", b: "" }));
  const [editableMoves, setEditableMoves] = useState<OcrMove[]>(defaultMoves);
  const [validationErrors, setValidationErrors] = useState<Map<number, string>>(new Map());

  /** Extract starting pit (1-9) from notation string like "76", "52X" */
  function pitFromNotation(notation: string): PitIndex | null {
    if (!notation) return null;
    const d = parseInt(notation[0]);
    return d >= 1 && d <= 9 ? (d as PitIndex) : null;
  }

  // Board replay from validated moves
  const replayData = useMemo(() => {
    const boards = [createInitialBoard()];
    const notations: { notation: string; side: "white" | "black" }[] = [];
    const rowNotations: { wNotation: string; bNotation: string }[] = [];
    let board = createInitialBoard();

    for (const move of editableMoves) {
      let wNot = "";
      let bNot = "";
      const wPit = pitFromNotation(move.w);
      if (wPit) {
        const result = makeMove(board, wPit);
        if (result) {
          board = result.boardAfter;
          boards.push(board);
          wNot = result.notation;
          notations.push({ notation: result.notation, side: "white" });
          if (getGameResult(board) !== "ongoing") { rowNotations.push({ wNotation: wNot, bNotation: bNot }); break; }
        }
      }
      const bPit = pitFromNotation(move.b);
      if (bPit) {
        const result = makeMove(board, bPit);
        if (result) {
          board = result.boardAfter;
          boards.push(board);
          bNot = result.notation;
          notations.push({ notation: result.notation, side: "black" });
          if (getGameResult(board) !== "ongoing") { rowNotations.push({ wNotation: wNot, bNotation: bNot }); break; }
        }
      }
      rowNotations.push({ wNotation: wNot, bNotation: bNot });
    }

    return { boards, notations, rowNotations };
  }, [editableMoves]);

  const [viewStep, setViewStep] = useState(0);
  const viewBoard = replayData.boards[viewStep] || createInitialBoard();
  const currentFen = useMemo(() => boardToFen(viewBoard), [viewBoard]);
  const pgnMoves = useMemo(() => toPgnMoves(replayData.notations), [replayData.notations]);
  const pgnText = useMemo(
    () => generatePgn(replayData.notations, { white: whitePlayer, black: blackPlayer, event: tournament, result: gameResult || undefined }),
    [replayData.notations, whitePlayer, blackPlayer, tournament, gameResult]
  );

  function validateMoves(moves: OcrMove[]) {
    const errors = new Map<number, string>();
    let board = createInitialBoard();

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const wPit = pitFromNotation(move.w);
      if (wPit) {
        const result = makeMove(board, wPit);
        if (!result) {
          errors.set(i * 2, `Ход ${move.w} невалиден`);
          break;
        }
        board = result.boardAfter;
        if (getGameResult(board) !== "ongoing") break;
      } else if (move.w && !wPit) {
        errors.set(i * 2, `Неверный формат: ${move.w}`);
        break;
      }
      const bPit = pitFromNotation(move.b);
      if (bPit) {
        const result = makeMove(board, bPit);
        if (!result) {
          errors.set(i * 2 + 1, `Ход ${move.b} невалиден`);
          break;
        }
        board = result.boardAfter;
        if (getGameResult(board) !== "ongoing") break;
      } else if (move.b && !bPit) {
        errors.set(i * 2 + 1, `Неверный формат: ${move.b}`);
        break;
      }
    }

    setValidationErrors(errors);
  }

  const handleDrop = useCallback((files: File[]) => {
    const f = files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  async function handleOcr() {
    if (!file) return;
    setProcessing(true);
    setOcrError(null);
    setActive(1);

    try {
      const { base64, mime } = await resizeAndBase64(file, 1024);
      const result = await processOcrDirect(base64, mime);

      if (result.error) {
        setOcrError(result.error);
        setProcessing(false);
        return;
      }

      const rawContent = result.content || "";
      if (!rawContent) {
        setOcrError("OCR вернул пустой ответ. Попробуйте другое фото.");
        setProcessing(false);
        return;
      }

      const parsed = parseOcrResponse(rawContent);
      if (!parsed) {
        setOcrError("Не удалось найти таблицу ходов. Ответ OCR:\n" + rawContent.slice(0, 400));
        setProcessing(false);
        return;
      }

      setOcrResult(parsed);
      // Fill OCR data into fixed 80-row grid (never change numbering)
      const grid: OcrMove[] = Array.from({ length: 80 }, (_, i) => {
        const ocr = parsed.moves.find((m) => m.n === i + 1);
        return { n: i + 1, w: ocr?.w || "", b: ocr?.b || "" };
      });
      setEditableMoves(grid);
      setWhitePlayer(parsed.white_player || "");
      setBlackPlayer(parsed.black_player || "");
      setTournament(parsed.tournament || "");
      setGameResult(parsed.result);
      validateMoves(parsed.moves);
      setViewStep(0);
      setActive(2);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setProcessing(false);
    }
  }

  function updateMove(index: number, field: "w" | "b", value: string) {
    const updated = [...editableMoves];
    updated[index] = { ...updated[index], [field]: value };
    setEditableMoves(updated);
    validateMoves(updated);
    setViewStep(0);
  }

  function addMoveRow() {
    const nextN = editableMoves.length + 1;
    setEditableMoves([...editableMoves, { n: nextN, w: "", b: "" }]);
  }

  function deleteMoveRow(index: number) {
    const updated = editableMoves.filter((_, i) => i !== index);
    const renumbered = updated.map((m, i) => ({ ...m, n: i + 1 }));
    setEditableMoves(renumbered);
    validateMoves(renumbered);
    setViewStep(0);
  }


  function handleSave() {
    setSaving(true);

    // Build moves from engine-computed notations (replayData has the correct notations)
    const movesWithNotation: { moveNumber: number; side: "white" | "black"; notation: string }[] = [];
    for (const n of replayData.notations) {
      const moveNum = n.side === "white"
        ? Math.floor(movesWithNotation.filter(m => m.side === "white").length) + 1
        : movesWithNotation.filter(m => m.side === "white").length;
      movesWithNotation.push({ moveNumber: moveNum, side: n.side, notation: n.notation });
    }

    try {
      const gameId = saveGameLocal({
        whitePlayer: whitePlayer || "Бастаушы",
        blackPlayer: blackPlayer || "Қостаушы",
        tournament: tournament || undefined,
        result: gameResult || "ongoing",
        sourceType: "ocr",
        moves: movesWithNotation,
      });

      notifications.show({ message: "Партия сохранена!", color: "green" });
      router.push(`/game/${gameId}`);
    } catch {
      notifications.show({ message: "Ошибка сохранения", color: "red" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack>
      <Title order={2}>Загрузка турнирного бланка</Title>

      <Stepper active={active}>
        <Stepper.Step label="Загрузка" description="Выберите фото">
          <Paper p="md" withBorder mt="md">
            <Dropzone
              onDrop={handleDrop}
              accept={IMAGE_MIME_TYPE}
              maxSize={20 * 1024 * 1024}
              multiple={false}
            >
              <Group justify="center" gap="xl" mih={200} style={{ pointerEvents: "none" }}>
                <Dropzone.Accept><IconUpload size={52} stroke={1.5} /></Dropzone.Accept>
                <Dropzone.Reject><IconX size={52} stroke={1.5} /></Dropzone.Reject>
                <Dropzone.Idle><IconPhoto size={52} stroke={1.5} /></Dropzone.Idle>
                <div>
                  <Text size="xl" inline>Перетащите фото бланка сюда</Text>
                  <Text size="sm" c="dimmed" inline mt={7}>JPEG, PNG до 20 МБ</Text>
                </div>
              </Group>
            </Dropzone>

            {preview && (
              <Stack mt="md" align="center">
                <Image src={preview} alt="Preview" maw={400} radius="md" />
                <Button
                  onClick={handleOcr}
                  loading={processing}
                  size="lg"
                  leftSection={<IconPlayerPlay size={20} />}
                >
                  Распознать бланк
                </Button>
              </Stack>
            )}
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Обработка" description="OCR распознавание">
          <Paper p="xl" withBorder mt="md">
            <Stack align="center" gap="md">
              {processing ? (
                <>
                  <Text size="lg">Распознавание бланка AI моделью...</Text>
                  <Progress value={60} size="xl" w="100%" animated />
                  <Text c="dimmed">Это может занять 10-30 секунд</Text>
                </>
              ) : ocrError ? (
                <Alert icon={<IconAlertCircle size={16} />} color="red" w="100%" title="Ошибка OCR">
                  {ocrError}
                  <Button mt="md" variant="light" onClick={() => { setActive(0); setOcrError(null); }}>
                    Попробовать снова
                  </Button>
                </Alert>
              ) : null}
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Результат" description="Проверка и партия">
          <Grid mt="md">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack>
                {/* Board preview */}
                <TogyzBoard board={viewBoard} />
                <BoardControls
                  currentStep={viewStep}
                  totalSteps={replayData.boards.length - 1}
                  onStepChange={setViewStep}
                />

                {/* Editable move table */}
                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={600}>Распознанные ходы</Text>
                    {validationErrors.size > 0 && (
                      <Badge color="orange">{validationErrors.size} ошибок</Badge>
                    )}
                  </Group>
                  <ScrollArea h={400}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th w={40}>#</Table.Th>
                          <Table.Th>Бастаушы</Table.Th>
                          <Table.Th>Қостаушы</Table.Th>
                          <Table.Th w={55}>Статус</Table.Th>
                          <Table.Th w={35}></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {editableMoves.map((move, idx) => {
                          const rn = replayData.rowNotations[idx];
                          const wError = validationErrors.has(idx * 2);
                          const bError = validationErrors.has(idx * 2 + 1);
                          const isEmpty = !move.w && !move.b;
                          const hasError = (move.w && wError) || (move.b && bError);
                          const rowOk = !isEmpty && !hasError;
                          return (
                          <Table.Tr key={idx}>
                            <Table.Td>{move.n}</Table.Td>
                            <Table.Td>
                              <Group gap={4} wrap="nowrap">
                                <TextInput
                                  value={move.w}
                                  onChange={(e) => updateMove(idx, "w", e.target.value.toUpperCase().slice(0, 3))}
                                  size="xs" w={55}
                                  error={!!(move.w && wError)}
                                  placeholder="—"
                                  maxLength={3}
                                  styles={{ input: { textAlign: "center", fontWeight: 700, fontFamily: "monospace" } }}
                                />
                                {rn?.wNotation && rn.wNotation !== move.w && (
                                  <Text size="xs" c="teal">{rn.wNotation}</Text>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap={4} wrap="nowrap">
                                <TextInput
                                  value={move.b}
                                  onChange={(e) => updateMove(idx, "b", e.target.value.toUpperCase().slice(0, 3))}
                                  size="xs" w={55}
                                  error={!!(move.b && bError)}
                                  placeholder="—"
                                  maxLength={3}
                                  styles={{ input: { textAlign: "center", fontWeight: 700, fontFamily: "monospace" } }}
                                />
                                {rn?.bNotation && rn.bNotation !== move.b && (
                                  <Text size="xs" c="teal">{rn.bNotation}</Text>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              {hasError
                                ? <Badge color="red" size="sm">!</Badge>
                                : rowOk
                                  ? <Badge color="green" size="sm">OK</Badge>
                                  : null}
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon size="xs" variant="subtle" color="red"
                                onClick={() => deleteMoveRow(idx)} title="Удалить ход">
                                <IconX size={12} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                  <Button size="xs" variant="light" onClick={addMoveRow} mt="xs" fullWidth>
                    + Добавить ход
                  </Button>
                </Paper>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack>
                {/* FEN + PGN + Move list */}
                <MoveListPanel
                  moves={pgnMoves}
                  fen={currentFen}
                  pgn={pgnText}
                  currentStep={viewStep}
                  onStepChange={setViewStep}
                />

                {/* Metadata + Save */}
                <Paper p="md" withBorder>
                  <Stack>
                    <Group grow>
                      <TextInput label="Бастаушы" value={whitePlayer} onChange={(e) => setWhitePlayer(e.target.value)} />
                      <TextInput label="Қостаушы" value={blackPlayer} onChange={(e) => setBlackPlayer(e.target.value)} />
                    </Group>
                    <TextInput label="Турнир" value={tournament} onChange={(e) => setTournament(e.target.value)} />
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
                    <Button leftSection={<IconCheck size={16} />} onClick={handleSave} loading={saving} size="lg">
                      Сохранить партию
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}
