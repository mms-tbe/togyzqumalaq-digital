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
  Loader,
  Center,
  ActionIcon,
} from "@mantine/core";
import { IconEye, IconTrash, IconArchive } from "@tabler/icons-react";
import { getGames, deleteGame } from "@/actions/games";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

interface Game {
  id: string;
  result: string;
  round: number | null;
  date_played: string | null;
  source_type: string;
  notes: string | null;
  created_at: string;
}

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  white: { label: "1-0", color: "blue" },
  black: { label: "0-1", color: "red" },
  draw: { label: "½-½", color: "gray" },
  ongoing: { label: "...", color: "yellow" },
};

export default function ArchivePage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    setLoading(true);
    const result = await getGames();
    setGames(result.games as Game[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteGame(id);
    if (result.error) {
      notifications.show({ message: result.error, color: "red" });
    } else {
      notifications.show({ message: "Партия удалена", color: "green" });
      loadGames();
    }
  }

  if (loading) {
    return (
      <Center h={300}>
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
            <Button onClick={() => router.push("/upload")}>
              Загрузить бланк
            </Button>
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
                      {game.source_type === "ocr" ? "OCR" : "Ручной"}
                    </Badge>
                  </Group>
                  <Text size="sm" lineClamp={2}>
                    {game.notes || "Без описания"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(game.created_at).toLocaleDateString("ru-RU")}
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
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(game.id)}
                    >
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
