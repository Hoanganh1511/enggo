"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import type {
  ApiKnowledgeGroup,
  ApiDocumentSummary,
  ApiWorkspaceWithGroups,
} from "@/lib/api/types";
import { getGroupDocumentsAction } from "@/actions/knowledge-groups/get-group-documents";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import {
  WorkspaceShellContext,
  type WorkspaceShellContextValue,
} from "./workspace-shell-context";

// Vo boc dung chung cho CA trang browse (page.tsx) LAN trang doc bai viet
// ([slug]/page.tsx) - render trong layout.tsx cua [workspaceId] nen KHONG
// remount khi dieu huong giua 2 trang (dac tinh layout.tsx trong Next.js App
// Router), giu sidebar/nhom dang chon "song" xuyen suot thay vi phai dung lai
// tu dau moi lan mo 1 bai viet (khac han cach lam cu trong WorkspaceDetail.tsx
// - toan bo state chi ton tai trong 1 client-state machine cua 1 trang duy
// nhat, khong co URL that cho tung bai viet).
export function WorkspaceShell({
  workspace,
  username,
  isSelf,
  children,
}: {
  workspace: ApiWorkspaceWithGroups;
  username: string;
  isSelf: boolean;
  children: React.ReactNode;
}) {
  const [groups, setGroups] = useState<ApiKnowledgeGroup[]>(workspace.groups);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    workspace.groups[0]?.id ?? null,
  );
  const [groupDocs, setGroupDocs] = useState<ApiDocumentSummary[]>([]);
  const [groupDocsLoading, startTransition] = useTransition();
  // Choreography luc vao trang: ArticleDetailPanel truot vao tu ngoai le man
  // hinh, CHI SAU KHI no "ha canh" xong stage giua moi hien trang thai/loading
  // - tranh cam giac moi thu bung ra cung luc. Khoi tao dung tu dau - workspace
  // khong co nhom nao thi stage mo khoa luon.
  const [panelsReady, setPanelsReady] = useState(workspace.groups.length === 0);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  const loadGroupDocs = useCallback((g: ApiKnowledgeGroup) => {
    setGroupDocs([]);
    if (g.viewerCanWrite || g.visibility === "PUBLIC") {
      startTransition(async () => {
        setGroupDocs(await getGroupDocumentsAction(g.id));
      });
    }
  }, []);

  const selectGroup = useCallback(
    (g: ApiKnowledgeGroup) => {
      setSelectedGroupId(g.id);
      loadGroupDocs(g);
    },
    [loadGroupDocs],
  );

  const selectGroupById = useCallback(
    (groupId: string) => {
      if (groupId === selectedGroupId) return;
      const g = groups.find((x) => x.id === groupId);
      if (g) selectGroup(g);
    },
    [groups, selectedGroupId, selectGroup],
  );

  // Nap bai viet cho nhom dau tien duoc chon san khi vao trang. workspace.groups
  // la du lieu Server Component da fetch (layout.tsx), khong can goi lai
  // listUserWorkspaces. Khong goi qua loadGroupDocs (se setGroupDocs([]) thua)
  // de effect nay khong con setState nao chay dong bo, chi con startTransition
  // (bat buoc, se bao loi "set-state-in-effect" neu goi truc tiep).
  useEffect(() => {
    const first = workspace.groups[0];
    if (!first) return;
    if (first.viewerCanWrite || first.visibility === "PUBLIC") {
      startTransition(async () => {
        setGroupDocs(await getGroupDocumentsAction(first.id));
      });
    }
    // Chi chay 1 lan luc mount - workspace.id doi = layout.tsx remount qua
    // key/route, khong phai props doi tai cho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: WorkspaceShellContextValue = {
    workspace,
    username,
    isSelf,
    groups,
    selectedGroup,
    groupDocs,
    groupDocsLoading,
    selectGroup,
    selectGroupById,
    panelsReady,
    setPanelsReady,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 flex h-full flex-col"
    >
      <div className="flex min-h-0 flex-1">
        <WorkspaceSidebar
          workspaceName={workspace.name}
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={selectGroup}
          isSelf={isSelf}
          workspaceId={workspace.id}
          username={username}
          onGroupCreated={(group) => {
            setGroups((prev) => [...prev, group]);
            setSelectedGroupId(group.id);
            setGroupDocs([]);
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <WorkspaceShellContext.Provider value={contextValue}>
            <div className="flex min-h-0 flex-1">{children}</div>
          </WorkspaceShellContext.Provider>
        </div>
      </div>
    </motion.div>
  );
}
