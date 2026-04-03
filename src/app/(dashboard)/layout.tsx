import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShellLayout } from "@/components/ui/AppShellLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShellLayout>{children}</AppShellLayout>;
}
