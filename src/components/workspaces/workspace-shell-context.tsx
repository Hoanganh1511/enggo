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
  panelsReady: boolean;
  setPanelsReady: (ready: boolean) => void;
};

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
