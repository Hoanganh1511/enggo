import { notFound } from "next/navigation";
import { listUserWorkspaces } from "@/lib/api/workspaces";
import { getProfileByUsername } from "@/lib/api/users";
import { WorkspaceShell } from "@/components/workspaces/WorkspaceShell";

// Layout dung chung cho CA trang browse (./page.tsx) LAN trang doc 1 bai
// viet (./[slug]/page.tsx) - fetch workspace/profile 1 LAN o day (khong lap
// lai o tung page con), render <WorkspaceShell> (sidebar + state nhom dang
// chon) boc quanh {children}. Layout.tsx KHONG remount khi dieu huong giua
// 2 trang con - day la ly do sidebar "song sot" qua lai viec mo 1 bai viet.
//
// Chua co endpoint "get 1 workspace theo id" rieng - dung lai
// listUserWorkspaces (giong trang chon workspace) roi loc theo workspaceId,
// giu dung 1 nguon fetch duy nhat (chuyen nguyen tu page.tsx cu).
export default async function WorkspaceDetailLayout({
  params,
  children,
}: {
  params: Promise<{ username: string; workspaceId: string }>;
  children: React.ReactNode;
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
    <WorkspaceShell
      workspace={workspace}
      username={uname}
      isSelf={profile?.isSelf ?? false}
    >
      {children}
    </WorkspaceShell>
  );
}
