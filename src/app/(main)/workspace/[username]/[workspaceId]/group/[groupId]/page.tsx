import { WorkspaceBrowseView } from "@/components/workspaces/WorkspaceBrowseView";

// Trang rieng cho 1 nhom kien thuc da chon - URL that (thay vi chi la state
// client nhu truoc), ho tro bam Back/refresh/dan link chia se dung nhom dang
// xem. Noi dung THAT van la WorkspaceBrowseView (dung chung voi ./../page.tsx,
// trang danh muc) - component do tu dong bo selectedGroupId trong
// WorkspaceShellContext theo groupId truyen xuong day.
export default async function GroupBrowsePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <WorkspaceBrowseView groupId={groupId} />;
}
