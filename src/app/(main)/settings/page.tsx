import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileByUsername } from "@/lib/api/users";
import SettingsShell from "@/components/settings/SettingsShell";

// Trang cai dat - "Hồ sơ công khai" gio doc/ghi du lieu THAT qua
// getProfileByUsername/updateProfileAction (PATCH /users/me) thay vi mock
// content/user-profile.ts nhu truoc - bio/location/websiteUrl/pronouns/role
// da co that o backend (UserProfile model), chi thieu duong ghi, gio da
// noi xong (xem docs/engineering-log.md).
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.username) redirect("/login");

  const profile = await getProfileByUsername(session.username);

  return (
    <SettingsShell profile={profile} email={session?.user?.email ?? "—"} />
  );
}
