"use client";

import { Menu, ActionIcon, Avatar } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { signOut } from "@/actions/auth";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" radius="xl">
          <Avatar size="sm" radius="xl" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUser size={16} />}
          onClick={() => router.push("/profile")}
        >
          Профиль
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          color="red"
          onClick={() => signOut()}
        >
          Выйти
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
