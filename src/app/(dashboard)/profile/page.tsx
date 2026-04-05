"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Stack,
  Paper,
  TextInput,
  Button,
  Group,
  Text,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser } from "@tabler/icons-react";
import { getProfile, updateProfile } from "@/actions/auth";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [club, setClub] = useState("");
  const [rating, setRating] = useState(1200);
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const data = await getProfile();
    if (data) {
      setDisplayName(data.display_name || "");
      setClub(data.club || "");
      setRating(data.rating || 1200);
      setRole(data.role || "player");
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const formData = new FormData();
    formData.set("displayName", displayName);
    formData.set("club", club);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.error) {
      notifications.show({ message: result.error, color: "red" });
    } else {
      notifications.show({ message: "Профиль сохранён в Supabase", color: "green" });
    }
  }

  if (loading) return <Center h={300}><Loader /></Center>;

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
                <Badge size="sm">{role}</Badge>
                <Badge size="sm" variant="light">Рейтинг: {rating}</Badge>
              </Group>
            </div>
          </Group>

          <TextInput label="Имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ваше имя" />
          <TextInput label="Клуб" value={club} onChange={(e) => setClub(e.target.value)} placeholder="Название клуба" />
          <Button onClick={handleSave} loading={saving}>Сохранить</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
