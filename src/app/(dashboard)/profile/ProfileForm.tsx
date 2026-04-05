"use client";

import { useState } from "react";
import { Title, Stack, Paper, TextInput, Button, Group, Text, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser } from "@tabler/icons-react";
import { updateProfile } from "@/actions/auth";
import type { ProfileData } from "@/actions/auth";

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [club, setClub] = useState(initial.club ?? "");
  const [rating, setRating] = useState(initial.rating ?? 1200);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("displayName", displayName);
    fd.set("club", club);
    fd.set("rating", String(rating));
    const result = await updateProfile(fd);
    setSaving(false);
    if (result.error) {
      notifications.show({ message: result.error, color: "red" });
    } else {
      notifications.show({ message: "Профиль сохранён в базе", color: "green" });
    }
  }

  return (
    <Stack>
      <Title order={2}>Профиль</Title>
      <Paper p="md" withBorder maw={500}>
        <Stack>
          <Group>
            <IconUser size={40} />
            <div>
              <Text fw={600}>{displayName || "Игрок"}</Text>
              <Text size="sm" c="dimmed">
                {initial.email || "—"}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge size="sm">{initial.role || "player"}</Badge>
                <Badge size="sm" variant="light">
                  Рейтинг: {rating}
                </Badge>
              </Group>
            </div>
          </Group>
          <TextInput
            label="Имя"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ваше имя"
          />
          <TextInput
            label="Клуб"
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder="Название клуба"
          />
          <TextInput
            label="Рейтинг"
            type="number"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value) || 1200)}
          />
          <Button onClick={() => void handleSave()} loading={saving}>
            Сохранить
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
