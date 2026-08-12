import { listUserWorkspaces } from "@/lib/api/workspaces";
import { getProfileByUsername } from "@/lib/api/users";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";

// Trang workspace DOC LAP - khong nam duoi u/[username]/layout.tsx nen
// khong bi ProfileShell (cover/user-info/ProfileNav) bao quanh. Tab
// "Workspace" trong ProfileNav dan thang toi day (xem ProfileNav.tsx);
// cac sub-route xem/soan bai viet (/u/[username]/workspaces/[slug],
// /new, /[slug]/edit) van o cho cu vi chung khong can "vu tru full man
// hinh" nay.
export default async function WorkspaceHubPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const uname = decodeURIComponent(username);
  const [workspaces, profile] = await Promise.all([
    listUserWorkspaces(uname).catch(() => []),
    getProfileByUsername(uname).catch(() => null),
  ]);

  return (
    <WorkspaceSwitcher
      workspaces={workspaces}
      username={uname}
      isSelf={profile?.isSelf ?? false}
    />
  );
}
