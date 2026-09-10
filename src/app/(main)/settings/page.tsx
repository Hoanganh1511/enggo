import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SettingsShell from "@/components/settings/SettingsShell";

// "Hồ sơ công khai" khong con o trang nay - da chuyen sang EditProfileModal
// (mo tu ProfileSidebar.tsx), nen khong con can fetch getProfileByUsername
// o day nua.
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.username) redirect("/login");

  return <SettingsShell email={session?.user?.email ?? "—"} />;
}
