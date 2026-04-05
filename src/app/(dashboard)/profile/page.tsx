"use client";

import { useEffect, useState } from "react";
import { Title, Stack, Paper, TextInput, Button, Group, Text, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser } from "@tabler/icons-react";

const PROFILE_KEY = "togyz_profile";

interface LocalProfile { displayName: string; club: string; rating: number; }

function load(): LocalProfile {
  if (typeof window === "undefined") return { displayName: "", club: "", rating: 1200 };
  try { const r = localStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : { displayName: "", club: "", rating: 1200 }; } catch { return { displayName: "", club: "", rating: 1200 }; }
}

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [club, setClub] = useState("");
  const [rating, setRating] = useState(1200);

  useEffect(() => { const p = load(); setDisplayName(p.displayName); setClub(p.club); setRating(p.rating); }, []);

  function handleSave() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ displayName, club, rating }));
    notifications.show({ message: "Профиль сохранён", color: "green" });
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
              <Group gap="xs">
                <Badge size="sm">player</Badge>
                <Badge size="sm" variant="light">Рейтинг: {rating}</Badge>
              </Group>
            </div>
          </Group>
          <TextInput label="Имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ваше имя" />
          <TextInput label="Клуб" value={club} onChange={(e) => setClub(e.target.value)} placeholder="Название клуба" />
          <Button onClick={handleSave}>Сохранить</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
