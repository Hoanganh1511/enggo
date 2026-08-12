"use client";

import { createContext, useContext } from "react";
import type { ReactorTool } from "@/components/ui/control-center-reactor";

// Cau noi giua page (WorkspaceSwitcher - biet isSelf/username, con cua
// layout) va layout.tsx (boc ControlCenterReactor) - trong Next.js App
// Router, layout CHI nhan {children} + route params, KHONG nhan duoc du
// lieu ma page/con no da fetch. Nen thay vi hardcode "Tao workspace" thanh 1
// tool tinh trong layout (khong biet isSelf), WorkspaceSwitcher tu "dang ky"
// tool nay qua context khi can (useEffect trong WorkspaceSwitcher.tsx), roi
// layout gop vao mang tools tinh (Doi giao dien/Huong dan) truoc khi render
// vao DUY NHAT 1 ControlCenterReactor.
type WorkspaceToolbarContextValue = {
  registerTool: (tool: ReactorTool | null) => void;
};

export const WorkspaceToolbarContext =
  createContext<WorkspaceToolbarContextValue | null>(null);

export function useWorkspaceToolbar() {
  const ctx = useContext(WorkspaceToolbarContext);
  return ctx ?? { registerTool: () => {} };
}
