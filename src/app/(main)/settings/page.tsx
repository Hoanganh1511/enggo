import { auth } from "@/auth";
import { getCurrentProfile } from "@/content/user-profile";
import SettingsShell from "@/components/settings/SettingsShell";

// Trang cai dat - Sidebar da tro toi /settings tu truoc nhung route chua ton
// tai (bam vao la 404), gio moi co that.
//
// Email lay tu session Google that; cac field con lai van la mock (xem
// src/content/user-profile.ts) vi backend chua co bang UserProfile.
export default async function SettingsPage() {
  const session = await auth();
  const profile = getCurrentProfile();

  return (
    <SettingsShell profile={profile} email={session?.user?.email ?? "—"} />
  );
}
