"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Stack,
  Card,
  Group,
  Text,
  Badge,
  Button,
  SimpleGrid,
  ActionIcon,
} from "@mantine/core";
import { IconEye, IconTrash, IconArchive } from "@tabler/icons-react";
import { getGamesLocal, deleteGameLocal, type StoredGame } from "@/lib/storage/games";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  white: { label: "1-0", color: "blue" },
  black: { label: "0-1", color: "red" },
  draw: { label: "½-½", color: "gray" },
  ongoing: { label: "...", color: "yellow" },
  "1-0": { label: "1-0", color: "blue" },
  "0-1": { label: "0-1", color: "red" },
  "1/2-1/2": { label: "½-½", color: "gray" },
};

export default function ArchivePage() {
  const router = useRouter();
  const [games, setGames] = useState<StoredGame[]>([]);

  useEffect(() => {
    setGames(getGamesLocal());
  }, []);

  function handleDelete(id: string) {
    deleteGameLocal(id);
    setGames(getGamesLocal());
    notifications.show({ message: "Партия удалена", color: "green" });
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Архив партий</Title>
        <Badge size="lg">{games.length} партий</Badge>
      </Group>

      {games.length === 0 ? (
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <IconArchive size={48} stroke={1} />
            <Text c="dimmed">Нет сохранённых партий</Text>
            <Button onClick={() => router.push("/upload")}>Загрузить бланк</Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {games.map((game) => {
            const r = RESULT_LABELS[game.result] || RESULT_LABELS.ongoing;
            return (
              <Card key={game.id} shadow="sm" padding="lg" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge color={r.color}>{r.label}</Badge>
                    <Badge variant="light">
                      {game.sourceType === "ocr" ? "OCR" : "Ручной"}
                    </Badge>
                  </Group>
                  <Text size="sm" fw={500}>
                    {game.whitePlayer} vs {game.blackPlayer}
                  </Text>
                  {game.tournament && (
                    <Text size="xs" c="dimmed">{game.tournament}</Text>
                  )}
                  <Text size="xs" c="dimmed">
                    {new Date(game.createdAt).toLocaleDateString("ru-RU")} | {game.moves.length} ходов
                  </Text>
                  <Group justify="flex-end">
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconEye size={14} />}
                      onClick={() => router.push(`/game/${game.id}`)}
                    >
                      Открыть
                    </Button>
                    <ActionIcon variant="light" color="red" onClick={() => handleDelete(game.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
