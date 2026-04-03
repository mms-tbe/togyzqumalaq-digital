"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Stack,
  Paper,
  TextInput,
  Button,
  Loader,
  Center,
  Group,
  Text,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser } from "@tabler/icons-react";
import { getProfile, updateProfile } from "@/actions/auth";

interface Profile {
  id: string;
  display_name: string;
  club: string | null;
  rating: number;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [club, setClub] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const data = await getProfile();
    if (data) {
      setProfile(data as Profile);
      setDisplayName(data.display_name || "");
      setClub(data.club || "");
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
      notifications.show({ message: "Профиль обновлён", color: "green" });
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
      <Title order={2}>Профиль</Title>

      <Paper p="md" withBorder maw={500}>
        <Stack>
          <Group>
            <IconUser size={40} />
            <div>
              <Text fw={600}>{profile?.display_name}</Text>
              <Group gap="xs">
                <Badge size="sm">{profile?.role}</Badge>
                <Badge size="sm" variant="light">
                  Рейтинг: {profile?.rating}
                </Badge>
              </Group>
            </div>
          </Group>

          <TextInput
            label="Имя"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextInput
            label="Клуб"
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder="Название клуба"
          />
          <Button onClick={handleSave} loading={saving}>
            Сохранить
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
