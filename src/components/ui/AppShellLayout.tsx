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
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { UserMenu } from "./UserMenu";
import Image from "next/image";

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
      padding="sm"
    >
      <AppShell.Header>
        <Group h="100%" px="sm" justify="space-between">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Image src="/logo.png" alt="Togyzqumalaq" width={40} height={40} />
            <Title order={3} style={{ fontSize: 18, letterSpacing: -0.3 }}>
              Togyzqumalaq Digital
            </Title>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={() => toggleColorScheme()}
            >
              {colorScheme === "dark" ? <IconSun size={22} /> : <IconMoon size={22} />}
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
            leftSection={<item.icon size={22} />}
            active={pathname === item.href}
            onClick={() => {
              router.push(item.href);
              toggle();
            }}
            mb={6}
            style={{ fontSize: 15 }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
