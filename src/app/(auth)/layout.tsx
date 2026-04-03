import { Center, Container } from "@mantine/core";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)">
      <Container size="xs" w="100%">
        {children}
      </Container>
    </Center>
  );
}
