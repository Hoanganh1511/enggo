"use client";

import { useEffect } from "react";
import { WorkspaceMain } from "./WorkspaceMain";
import { ArticleDetailPanel } from "./ArticleDetailPanel";
import { WorkspaceOverviewPanel } from "./WorkspaceOverviewPanel";
import { useWorkspaceShell } from "./workspace-shell-context";

// Noi dung trang browse - dung CHUNG boi 2 route THAT: page.tsx (danh muc,
// khong truyen groupId) va group/[groupId]/page.tsx (1 nhom da chon) - UI/
// logic con lai giong het nhau, chi khac o groupId prop. Effect duoi day dong
// bo NGUOC: URL (groupId prop) -> selectedGroupId trong WorkspaceShellContext,
// can thiet cho MOI cach den 1 trong 2 route ma KHONG qua 1 click co san
// onClick (bam nut Back cua trinh duyet, go thang URL, mo link chia se...) -
// cung 1 tinh than voi effect selectGroupById() da co san trong
// ArticleReaderPane.tsx cho trang doc bai viet.
export function WorkspaceBrowseView({ groupId }: { groupId?: string }) {
  const {
    username,
    selectedGroup,
    groupDocs,
    groupDocsLoading,
    panelsReady,
    selectGroupById,
    clearSelectedGroup,
  } = useWorkspaceShell();

  useEffect(() => {
    if (groupId) selectGroupById(groupId);
    else clearSelectedGroup();
  }, [groupId, selectGroupById, clearSelectedGroup]);

  return (
    <>
      <WorkspaceMain
        group={selectedGroup}
        docs={groupDocs}
        loading={groupDocsLoading}
        panelsReady={panelsReady}
        username={username}
      />

      {/* Cot phai: tong quan NHOM dang chon, hoac tong quan CA WORKSPACE khi
          chua chon nhom nao (xem WorkspaceOverviewPanel.tsx) - luon co gi do
          o cot phai thay vi de trong khi dang o man tong quan. */}
      {selectedGroup ? (
        <ArticleDetailPanel group={selectedGroup} />
      ) : (
        <WorkspaceOverviewPanel />
      )}
    </>
  );
}
