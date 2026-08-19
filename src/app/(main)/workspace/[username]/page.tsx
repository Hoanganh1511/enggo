import { listUserWorkspaces, listSuggestedWorkspaces } from "@/lib/api/workspaces";
import { getProfileByUsername } from "@/lib/api/users";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";
import { WorkspaceHubChrome } from "@/components/workspaces/WorkspaceHubChrome";

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
  // suggested luon fetch song song (re, chi top 12 workspace tu nguoi
  // viewer dang follow) - CHI hien khi isSelf (xem WorkspaceSwitcher.tsx),
  // nhung fetch truoc o day de tranh phai await tuan tu sau khi biet isSelf.
  const [workspaces, profile, suggested] = await Promise.all([
    listUserWorkspaces(uname).catch(() => []),
    getProfileByUsername(uname).catch(() => null),
    listSuggestedWorkspaces().catch(() => []),
  ]);

  return (
    <WorkspaceHubChrome>
      <WorkspaceSwitcher
        workspaces={workspaces}
        username={uname}
        isSelf={profile?.isSelf ?? false}
        ownerName={profile?.displayName ?? uname}
        ownerAvatarUrl={profile?.avatarUrl ?? null}
        suggested={suggested}
      />
    </WorkspaceHubChrome>
  );
}
