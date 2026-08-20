"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type {
  ApiKnowledgeGroup,
  ApiDocumentSummary,
  ApiWorkspaceWithGroups,
} from "@/lib/api/types";
import { getGroupDocumentsAction } from "@/actions/knowledge-groups/get-group-documents";
import { toast } from "@/lib/toast/toast-store";
import { GroupSidebar } from "./GroupSidebar";
import { WorkspaceAiAssistant } from "./WorkspaceAiAssistant";
import {
  WorkspaceShellContext,
  type GroupSection,
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
  const router = useRouter();
  const [groups, setGroups] = useState<ApiKnowledgeGroup[]>(workspace.groups);
  // Mac dinh KHONG chon nhom nao - man hinh mo dau la tong quan dang "tang"
  // (KnowledgeGroupFloors.tsx), nguoi dung phai chu dong click 1 the nhom moi
  // "vao" chi tiet. Khac ban truoc (tu dong chon nhom dau tien).
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDocs, setGroupDocs] = useState<ApiDocumentSummary[]>([]);
  const [groupDocsLoading, startTransition] = useTransition();
  // Choreography luc VAO 1 nhom (tu man tong quan): GroupArticleToc (trai) +
  // ArticleDetailPanel (phai) truot vao tu ngoai le man hinh, CHI SAU KHI
  // ArticleDetailPanel "ha canh" xong thi BranchStage moi hien noi dung - tranh
  // cam giac moi thu bung ra cung luc. Man tong quan (chua chon nhom) khong co
  // panel nao truot vao nen luon san sang tu dau.
  const [panelsReady, setPanelsReady] = useState(true);
  // "Trang" dang xem trong nhom da chon (Overview/Roadmap/Kien thuc/Bai
  // viet/...) - xem GroupSection trong workspace-shell-context.tsx.
  const [activeSection, setActiveSection] = useState<GroupSection>("overview");

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  // Bat try/catch NGAY TRONG startTransition - neu getGroupDocumentsAction
  // reject ma khong bat, isPending (groupDocsLoading) co the ket qua bi ket
  // lai true mai mai (khong co state update nao de "chot" transition), khien
  // panel trai quay loading vo han khi backend loi/timeout giua chung.
  const loadGroupDocs = useCallback((g: ApiKnowledgeGroup) => {
    setGroupDocs([]);
    if (g.viewerCanWrite || g.visibility === "PUBLIC") {
      startTransition(async () => {
        try {
          setGroupDocs(await getGroupDocumentsAction(g.id));
        } catch (err) {
          console.error("getGroupDocumentsAction failed", err);
          setGroupDocs([]);
          toast.danger("Không tải được danh sách bài viết, thử lại sau.");
        }
      });
    }
  }, []);

  const selectGroup = useCallback(
    (g: ApiKnowledgeGroup) => {
      // Chi doi lai choreography khi dang tu man tong quan (chua chon nhom
      // nao) di VAO 1 nhom - chuyen giua 2 nhom da chon san thi panel khong
      // remount/truot lai (xem GroupSidebar.tsx/ArticleDetailPanel.tsx), nen
      // khong can dat lai panelsReady. Cung CHI reset activeSection ve
      // "overview" luc nay - vao lai 1 nhom (tu man tong quan) luon bat dau
      // o Overview, nhung chuyen QUA LAI giua cac nhom da chon (vd tu sidebar/
      // breadcrumb) thi GIU nguyen trang dang xem.
      if (selectedGroupId === null) {
        setPanelsReady(false);
        setActiveSection("overview");
      }
      setSelectedGroupId(g.id);
      loadGroupDocs(g);
    },
    [selectedGroupId, loadGroupDocs],
  );

  const selectGroupById = useCallback(
    (groupId: string) => {
      if (groupId === selectedGroupId) return;
      const g = groups.find((x) => x.id === groupId);
      if (g) selectGroup(g);
    },
    [groups, selectedGroupId, selectGroup],
  );

  // Ve lai man tong quan - nut "TAT CA NHOM" trong GroupArticleToc.tsx.
  const clearSelectedGroup = useCallback(() => {
    setSelectedGroupId(null);
    setGroupDocs([]);
  }, []);

  const addGroup = useCallback(
    (group: ApiKnowledgeGroup) => {
      setGroups((prev) => [...prev, group]);
      // Tu dong "vao" luon nhom vua tao (giong hanh vi cu cua
      // WorkspaceSidebar/onGroupCreated) - di qua selectGroup de choreography
      // (panelsReady) duoc xu ly nhat quan voi moi cach chon nhom khac, roi
      // dieu huong toi URL that cua nhom (xem group/[groupId]/page.tsx).
      selectGroup(group);
      router.push(`/workspace/${username}/${workspace.id}/group/${group.id}`);
    },
    [selectGroup, router, username, workspace.id],
  );

  const refreshGroupDocs = useCallback(() => {
    if (selectedGroup) loadGroupDocs(selectedGroup);
  }, [selectedGroup, loadGroupDocs]);

  // Chi ghi de name/description/goal/visibility/updatedAt (dung field response
  // PATCH /knowledge-groups/:id THAT SU tra ve co the doi) - KHONG spread
  // nguyen response nay de vao, vi toApi() cua endpoint update() luon tra
  // pendingRequests=[] (khong phai danh sach that, xem knowledge-group.service.ts)
  // va thieu han checklistTotal/checklistUnderstood - lam vay se "xoa oan"
  // cac field do khoi state cuc bo dang co du lieu that.
  const updateGroupInState = useCallback((updated: ApiKnowledgeGroup) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === updated.id
          ? {
              ...g,
              name: updated.name,
              description: updated.description,
              goal: updated.goal,
              visibility: updated.visibility,
              updatedAt: updated.updatedAt,
            }
          : g,
      ),
    );
  }, []);

  const removeGroupFromState = useCallback(
    (groupId: string) => {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setGroupDocs([]);
      }
    },
    [selectedGroupId],
  );

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
    clearSelectedGroup,
    addGroup,
    updateGroupInState,
    removeGroupFromState,
    refreshGroupDocs,
    panelsReady,
    setPanelsReady,
    activeSection,
    setActiveSection,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 flex h-full flex-col"
    >
      {/* gap-3 + p-3: cac panel (sidebar/main/aside) gio la CARD noi rieng
          (rounded-[13px] + border, xem GroupSidebar.tsx/ArticleReaderPane.tsx/
          WorkspaceMain.tsx) thay vi flush sat nhau - khoang ho giua chung +
          quanh rim de lo mau nen trang (var(--background), nhat hon
          var(--surface) cua panel - xem body trong globals.css), theo phan
          hoi nguoi dung. */}
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <WorkspaceShellContext.Provider value={contextValue}>
          {selectedGroup && <GroupSidebar group={selectedGroup} />}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* gap-3 o day rieng cho hang con (vd WorkspaceMain + ArticleDetailPanel/
                WorkspaceOverviewPanel tren trang browse, hoac card giua +
                aside tren trang doc bai - xem ArticleReaderPane.tsx da tu
                dat gap-3 rieng nen khong bi cong don). */}
            <div className="flex min-h-0 flex-1 gap-3">{children}</div>
          </div>
        </WorkspaceShellContext.Provider>
      </div>

      <WorkspaceAiAssistant workspaceId={workspace.id} />
    </motion.div>
  );
}
