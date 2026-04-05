import { redirect } from "next/navigation";
import { Title, Stack, Paper, Table, Text, Alert, Code } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { listUsers } from "@/actions/users";

export default async function UsersPage() {
  const result = await listUsers();
  if ("error" in result) {
    if (result.error === "Не авторизован") redirect("/login");
    return (
      <Stack>
        <Title order={2}>Участники</Title>
        <Text c="red">{result.error}</Text>
      </Stack>
    );
  }

  const { users } = result;

  return (
    <Stack>
      <Title order={2}>Участники</Title>
      <Alert icon={<IconInfoCircle size={18} />} color="blue" variant="light">
        Учётные записи в <Code>public.profiles</Code>: колонка <Code>password_hash</Code> — bcrypt (только
        на сервере). Сессия — httpOnly cookie <Code>togyz_session</Code> (JWT).
      </Alert>
      <Paper withBorder p="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>Имя</Table.Th>
              <Table.Th>Клуб</Table.Th>
              <Table.Th>Рейтинг</Table.Th>
              <Table.Th>Роль</Table.Th>
              <Table.Th>Регистрация</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" size="sm">
                    Пока нет записей в profiles.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.email || "—"}</Table.Td>
                  <Table.Td>{u.display_name || "—"}</Table.Td>
                  <Table.Td>{u.club || "—"}</Table.Td>
                  <Table.Td>{u.rating ?? "—"}</Table.Td>
                  <Table.Td>{u.role || "—"}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {u.created_at ? new Date(u.created_at).toLocaleString("ru-RU") : "—"}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
