"use client";

import {
  Card,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Image from "next/image";
import { signIn } from "@/actions/auth";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <Stack align="center" mb="md">
        <Image src="/logo.png" alt="Togyzqumalaq" width={128} height={128} />
        <Title order={2}>Вход</Title>
        <Text c="dimmed" size="sm">
          Togyzqumalaq Digital
        </Text>
      </Stack>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <form action={handleSubmit}>
        <Stack>
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
          />
          <PasswordInput
            label="Пароль"
            name="password"
            placeholder="Введите пароль"
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Войти
          </Button>
          <Text size="sm" ta="center">
            Нет аккаунта?{" "}
            <Anchor component={Link} href="/register">
              Зарегистрироваться
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Card>
  );
}
