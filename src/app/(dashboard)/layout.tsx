import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AppShellLayout } from "@/components/ui/AppShellLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <AppShellLayout>{children}</AppShellLayout>;
}
