import { Center, Container } from "@mantine/core";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) {
    redirect("/upload");
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)">
      <Container size="xs" w="100%">
        {children}
      </Container>
    </Center>
  );
}
