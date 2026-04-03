"use client";

import { useState, useCallback, useEffect } from "react";
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
  NumberInput,
  TextInput,
  Select,
  Alert,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { uploadSheet } from "@/actions/upload";
import { triggerOcr, getOcrJobStatus } from "@/actions/ocr";
import { saveGame } from "@/actions/games";
import { parseOcrResponse, ocrMovesToParsed, type OcrResult, type OcrMove } from "@/lib/ocr/parser";
import { type PitIndex } from "@/lib/engine/types";
import { createInitialBoard, makeMove, getGameResult } from "@/lib/engine/TogyzEngine";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState<string>("pending");
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Metadata
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [tournament, setTournament] = useState("");
  const [gameResult, setGameResult] = useState<string | null>(null);

  // Editable moves
  const [editableMoves, setEditableMoves] = useState<OcrMove[]>([]);
  const [validationErrors, setValidationErrors] = useState<Map<number, string>>(new Map());
  const [filePath, setFilePath] = useState<string | null>(null);

  // Poll OCR status
  useEffect(() => {
    if (!jobId || ocrStatus === "completed" || ocrStatus === "failed") return;

    const interval = setInterval(async () => {
      const result = await getOcrJobStatus(jobId);
      if (result.error) return;
      const job = result.job;
      if (!job) return;

      setProgress(job.progress || 0);
      setOcrStatus(job.status);

      if (job.status === "completed" && job.raw_result) {
        const parsed = parseOcrResponse(job.raw_result.content);
        if (parsed) {
          setOcrResult(parsed);
          setEditableMoves(parsed.moves);
          setWhitePlayer(parsed.white_player || "");
          setBlackPlayer(parsed.black_player || "");
          setTournament(parsed.tournament || "");
          setGameResult(parsed.result);
          validateMoves(parsed.moves);
          setActive(2);
        } else {
          setOcrError("Не удалось распарсить ответ OCR");
        }
        clearInterval(interval);
      } else if (job.status === "failed") {
        setOcrError(job.error_message || "Ошибка OCR");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, ocrStatus]);

  function validateMoves(moves: OcrMove[]) {
    const errors = new Map<number, string>();
    let board = createInitialBoard();

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];

      // Validate white move
      if (move.w !== null) {
        const result = makeMove(board, move.w as PitIndex);
        if (!result) {
          errors.set(i * 2, `Ход белых ${move.w} невалиден`);
          break; // Can't continue validation after invalid move
        }
        board = result.boardAfter;
        if (getGameResult(board) !== "ongoing") break;
      }

      // Validate black move
      if (move.b !== null) {
        const result = makeMove(board, move.b as PitIndex);
        if (!result) {
          errors.set(i * 2 + 1, `Ход чёрных ${move.b} невалиден`);
          break;
        }
        board = result.boardAfter;
        if (getGameResult(board) !== "ongoing") break;
      }
    }

    setValidationErrors(errors);
  }

  const handleDrop = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadResult = await uploadSheet(formData);
    if (uploadResult.error) {
      notifications.show({ message: uploadResult.error, color: "red" });
      setUploading(false);
      return;
    }

    setFilePath(uploadResult.filePath!);

    // Trigger OCR
    const ocrTrigger = await triggerOcr(uploadResult.filePath!);
    if (ocrTrigger.error) {
      notifications.show({ message: ocrTrigger.error, color: "red" });
      setUploading(false);
      return;
    }

    setJobId(ocrTrigger.jobId!);
    setOcrStatus("processing");
    setActive(1);
    setUploading(false);
  }

  function updateMove(index: number, field: "w" | "b", value: number | null) {
    const updated = [...editableMoves];
    updated[index] = { ...updated[index], [field]: value };
    setEditableMoves(updated);
    validateMoves(updated);
  }

  async function handleSave() {
    setSaving(true);

    const moves: { moveNumber: number; side: "white" | "black"; pit: number }[] = [];
    for (const move of editableMoves) {
      if (move.w !== null) {
        moves.push({ moveNumber: move.n, side: "white", pit: move.w });
      }
      if (move.b !== null) {
        moves.push({ moveNumber: move.n, side: "black", pit: move.b });
      }
    }

    const result = await saveGame({
      whitePlayer: whitePlayer || "Белые",
      blackPlayer: blackPlayer || "Чёрные",
      tournament: tournament || undefined,
      result: gameResult || "ongoing",
      sourceType: "ocr",
      sourceFileUrl: filePath || undefined,
      ocrModelUsed: "deepseek-ocr",
      moves,
    });

    setSaving(false);

    if (result.error) {
      notifications.show({ message: result.error, color: "red" });
      return;
    }

    notifications.show({ message: "Партия сохранена!", color: "green" });
    router.push(`/game/${result.gameId}`);
  }

  return (
    <Stack>
      <Title order={2}>Загрузка турнирного бланка</Title>

      <Stepper active={active}>
        <Stepper.Step label="Загрузка" description="Выберите файл">
          <Paper p="md" withBorder mt="md">
            <Dropzone
              onDrop={handleDrop}
              accept={IMAGE_MIME_TYPE}
              maxSize={20 * 1024 * 1024}
              multiple={false}
            >
              <Group justify="center" gap="xl" mih={200} style={{ pointerEvents: "none" }}>
                <Dropzone.Accept>
                  <IconUpload size={52} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={52} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={52} stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="xl" inline>
                    Перетащите фото бланка сюда
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    JPEG, PNG до 20 МБ
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {preview && (
              <Stack mt="md" align="center">
                <Image src={preview} alt="Preview" maw={400} radius="md" />
                <Button onClick={handleUpload} loading={uploading} size="lg">
                  Распознать бланк
                </Button>
              </Stack>
            )}
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Обработка" description="OCR распознавание">
          <Paper p="xl" withBorder mt="md">
            <Stack align="center" gap="md">
              <Text size="lg">Распознавание бланка...</Text>
              <Progress value={progress} size="xl" w="100%" animated />
              <Text c="dimmed">
                {ocrStatus === "processing" ? "Обработка изображения AI моделью" : ocrStatus}
              </Text>
              {ocrError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" w="100%">
                  {ocrError}
                </Alert>
              )}
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Результат" description="Проверка и сохранение">
          <Paper p="md" withBorder mt="md">
            <Stack>
              <Group grow>
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
              </Group>
              <Group grow>
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
              </Group>

              {validationErrors.size > 0 && (
                <Alert icon={<IconAlertCircle size={16} />} color="orange">
                  Обнаружены невалидные ходы. Проверьте и исправьте выделенные ячейки.
                </Alert>
              )}

              <ScrollArea h={400}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={60}>#</Table.Th>
                      <Table.Th>Белые</Table.Th>
                      <Table.Th>Чёрные</Table.Th>
                      <Table.Th w={100}>Статус</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {editableMoves.map((move, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{move.n}</Table.Td>
                        <Table.Td>
                          <NumberInput
                            value={move.w ?? undefined}
                            onChange={(val) =>
                              updateMove(idx, "w", typeof val === "number" ? val : null)
                            }
                            min={1}
                            max={9}
                            size="xs"
                            w={70}
                            error={validationErrors.has(idx * 2)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            value={move.b ?? undefined}
                            onChange={(val) =>
                              updateMove(idx, "b", typeof val === "number" ? val : null)
                            }
                            min={1}
                            max={9}
                            size="xs"
                            w={70}
                            error={validationErrors.has(idx * 2 + 1)}
                          />
                        </Table.Td>
                        <Table.Td>
                          {validationErrors.has(idx * 2) || validationErrors.has(idx * 2 + 1) ? (
                            <Badge color="red" size="sm">Ошибка</Badge>
                          ) : (
                            <Badge color="green" size="sm">OK</Badge>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Group justify="flex-end">
                <Button
                  leftSection={<IconCheck size={16} />}
                  onClick={handleSave}
                  loading={saving}
                  size="lg"
                >
                  Сохранить партию
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}
