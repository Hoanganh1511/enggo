"use client";

import { createContext, useContext } from "react";
import type {
  ApiDocumentSummary,
  ApiKnowledgeGroup,
  ApiWorkspaceWithGroups,
} from "@/lib/api/types";

// Cau noi giua WorkspaceShell.tsx (layout.tsx cua [workspaceId], quan ly
// sidebar + nhom dang chon + danh sach bai viet cua nhom) va CAC TRANG CON
// (page.tsx browse, [slug]/page.tsx doc bai viet) - can thiet vi 2 trang con
// nam o 2 file route KHAC NHAU (Server Component), khong the prop-drill xuyen
// qua ranh gioi route nhu 1 cay component thong thuong. Sidebar KHONG remount
// khi dieu huong giua 2 trang (dac tinh layout.tsx cua Next.js App Router) -
// day chinh la co che giu sidebar "song" qua lai dieu huong bai viet.
export type WorkspaceShellContextValue = {
  workspace: ApiWorkspaceWithGroups;
  username: string;
  isSelf: boolean;
  groups: ApiKnowledgeGroup[];
  selectedGroup: ApiKnowledgeGroup | null;
  groupDocs: ApiDocumentSummary[];
  groupDocsLoading: boolean;
  selectGroup: (g: ApiKnowledgeGroup) => void;
  // Dung boi trang doc bai viet ([slug]/page.tsx) de dam bao sidebar/danh
  // sach nhom highlight DUNG nhom cua bai dang doc - can thiet vi nguoi dung
  // co the vao thang URL bai viet (khong qua click tu list), luc do
  // selectedGroup mac dinh (nhom dau tien) co the SAI.
  selectGroupById: (groupId: string) => void;
  // Ve lai man tong quan (khong nhom nao duoc chon) - dung boi nut "Tat ca
  // nhom" trong GroupArticleToc.tsx de thoat khoi 1 nhom dang xem.
  clearSelectedGroup: () => void;
  // Them 1 nhom MOI tao vao state cuc bo (KnowledgeGroupFloors.tsx goi sau
  // khi CreateGroupButton tao thanh cong) - khong con di qua prop
  // onGroupCreated rieng nhu ban cu (sidebar cu la noi DUY NHAT dung no).
  addGroup: (group: ApiKnowledgeGroup) => void;
  // Cap nhat 1 nhom da co san trong state cuc bo (vd sau khi sua ten/mo ta/
  // quyen xem qua modal sua nhom) - patch DUNG 1 phan tu trong `groups` bang
  // response moi nhat tu backend, khong refetch lai toan bo danh sach.
  updateGroupInState: (group: ApiKnowledgeGroup) => void;
  // Nap lai groupDocs cua nhom dang chon - dung sau khi tao/sua/xoa series
  // (gop bai vao 1 nhom "cung chu de") vi groupDocs la client state rieng
  // (khong qua Next.js page cache/revalidatePath, xem WorkspaceShell.tsx).
  refreshGroupDocs: () => void;
  panelsReady: boolean;
  setPanelsReady: (ready: boolean) => void;
  // "Trang" dang xem BEN TRONG 1 nhom da chon (GroupSidebar.tsx) - client-side
  // view state, KHONG phai URL route rieng (giu group selection/nav don gian,
  // cung tinh than voi ArticleTabs.tsx trong ArticleReaderPane.tsx). Reset ve
  // "overview" moi lan CHUYEN TU man tong quan VAO 1 nhom - xem selectGroup
  // trong WorkspaceShell.tsx.
  activeSection: GroupSection;
  setActiveSection: (section: GroupSection) => void;
};

export type GroupSection =
  | "overview"
  | "roadmap"
  | "knowledge"
  | "articles"
  | "goals"
  | "tasks"
  | "review"
  | "progress"
  | "members"
  | "settings";

export const WorkspaceShellContext =
  createContext<WorkspaceShellContextValue | null>(null);

export function useWorkspaceShell(): WorkspaceShellContextValue {
  const ctx = useContext(WorkspaceShellContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceShell() phai duoc goi ben trong <WorkspaceShell> (xem layout.tsx cua /workspace/[username]/[workspaceId]).",
    );
  }
  return ctx;
}
