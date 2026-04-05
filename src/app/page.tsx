import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/upload");
  } else {
    redirect("/login");
  }
}
