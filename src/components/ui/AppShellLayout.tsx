"use client";

import { AppShell, Burger, Group, Title, NavLink, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUpload,
  IconEdit,
  IconArchive,
  IconUser,
  IconSun,
  IconMoon,
  IconChess,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { UserMenu } from "./UserMenu";

const NAV_ITEMS = [
  { label: "Загрузить бланк", href: "/upload", icon: IconUpload },
  { label: "Ручной ввод", href: "/manual", icon: IconEdit },
  { label: "Архив партий", href: "/archive", icon: IconArchive },
  { label: "Профиль", href: "/profile", icon: IconUser },
];

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconChess size={28} />
            <Title order={3} size="h4">
              Togyzqumalaq Digital
            </Title>
          </Group>
          <Group>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={() => toggleColorScheme()}
            >
              {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={<item.icon size={20} />}
            active={pathname === item.href}
            onClick={() => {
              router.push(item.href);
              toggle();
            }}
            mb={4}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
