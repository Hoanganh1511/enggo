import { notFound } from "next/navigation";
import { listUserWorkspaces } from "@/lib/api/workspaces";
import { getProfileByUsername } from "@/lib/api/users";
import { WorkspaceDetail } from "@/components/workspaces/WorkspaceDetail";

// Trang chi tiet 1 workspace - TACH RIENG khoi trang chon workspace
// (/workspace/[username]/page.tsx), truoc day noi dung nay nam trong
// WorkspaceSwitcher.tsx nhu 1 "phase" noi bo (khong doi URL). Nam cung
// layout.tsx voi trang chon (StarfieldBackground + ControlCenterReactor tu
// dong ap dung, khong can lap lai o day).
//
// Chua co endpoint "get 1 workspace theo id" rieng - dung lai
// listUserWorkspaces (giong trang chon) roi loc theo workspaceId, giu dung 1
// nguon fetch duy nhat cho ca 2 trang.
export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ username: string; workspaceId: string }>;
}) {
  const { username, workspaceId } = await params;
  const uname = decodeURIComponent(username);
  const [workspaces, profile] = await Promise.all([
    listUserWorkspaces(uname).catch(() => []),
    getProfileByUsername(uname).catch(() => null),
  ]);

  const workspace = workspaces.find((ws) => ws.id === workspaceId);
  if (!workspace) notFound();

  return (
    <WorkspaceDetail
      workspace={workspace}
      username={uname}
      isSelf={profile?.isSelf ?? false}
    />
  );
}
