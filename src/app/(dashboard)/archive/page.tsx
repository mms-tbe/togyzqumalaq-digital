"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Title, Stack, Card, Group, Text, Badge, Button, SimpleGrid, ActionIcon, Loader, Center,
} from "@mantine/core";
import { IconEye, IconTrash, IconArchive } from "@tabler/icons-react";
import { getGames, deleteGame } from "@/actions/games";
import type { GameSummary } from "@/lib/games/types";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function ArchivePage() {
  const router = useRouter();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async () => {
    setLoading(true);
    const result = await getGames();
    if ("error" in result && result.error) {
      notifications.show({ message: result.error, color: "red" });
      setGames([]);
    } else {
      setGames(result.games);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  async function handleDelete(id: string) {
    const result = await deleteGame(id);
    if (result.error) {
      notifications.show({ message: result.error, color: "red" });
      return;
    }
    notifications.show({ message: "Партия удалена", color: "green" });
    void loadGames();
  }

  if (loading) {
    return (
      <Center mih={200}>
        <Loader />
      </Center>
    );
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
          {games.map((game) => (
            <Card key={game.id} shadow="sm" padding="lg" withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge color={game.result === "1-0" ? "blue" : game.result === "0-1" ? "red" : "gray"}>
                    {game.result}
                  </Badge>
                  <Badge variant="light">{game.sourceType === "ocr" ? "OCR" : "Ручной"}</Badge>
                </Group>
                <Text size="sm" fw={500}>{game.whitePlayer} vs {game.blackPlayer}</Text>
                {game.tournament && <Text size="xs" c="dimmed">{game.tournament}</Text>}
                <Text size="xs" c="dimmed">{new Date(game.createdAt).toLocaleDateString("ru-RU")} | {game.moveCount} ходов</Text>
                <Group justify="flex-end">
                  <Button size="xs" variant="light" leftSection={<IconEye size={14} />} onClick={() => router.push(`/game/${game.id}`)}>Открыть</Button>
                  <ActionIcon variant="light" color="red" onClick={() => void handleDelete(game.id)}><IconTrash size={14} /></ActionIcon>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
