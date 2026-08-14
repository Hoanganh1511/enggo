"use client";

import { WorkspaceMain } from "./WorkspaceMain";
import { ArticleDetailPanel } from "./ArticleDetailPanel";
import { useWorkspaceShell } from "./workspace-shell-context";

// Noi dung trang browse (danh sach nhom da o WorkspaceSidebar, day chi con
// ArticleList + ArticleDetailPanel) - doc toan bo du lieu tu
// WorkspaceShellContext (nhom dang chon, danh sach bai viet) thay vi nhan
// qua props nhu WorkspaceDetail.tsx cu, vi trang nay va trang doc bai viet
// ([slug]/page.tsx) la 2 route KHAC NHAU, khong con la 2 nhanh render trong
// CUNG 1 component nua.
export function WorkspaceBrowseView() {
  const { workspace, username, selectedGroup, groupDocs, groupDocsLoading, panelsReady } =
    useWorkspaceShell();

  return (
    <>
      <WorkspaceMain
        group={selectedGroup}
        docs={groupDocs}
        loading={groupDocsLoading}
        panelsReady={panelsReady}
        username={username}
        workspaceId={workspace.id}
      />

      {selectedGroup && (
        <ArticleDetailPanel group={selectedGroup} docs={groupDocs} />
      )}
    </>
  );
}
