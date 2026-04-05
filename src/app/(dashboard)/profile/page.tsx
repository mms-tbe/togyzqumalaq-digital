import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  return <ProfileForm initial={profile} />;
}
