import { WorkspaceBrowseView } from "@/components/workspaces/WorkspaceBrowseView";

// Trang browse (danh sach nhom + ArticleList + ArticleDetailPanel) - workspace/
// profile da duoc fetch san o layout.tsx (dung chung voi ./[slug]/page.tsx),
// nen trang nay khong can fetch gi them, chi render view doc du lieu tu
// WorkspaceShellContext.
export default function WorkspaceBrowsePage() {
  return <WorkspaceBrowseView />;
}
