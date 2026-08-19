"use client";

import { useState } from "react";
import { CircleHelp, LayoutGrid, Star, TrendingUp } from "lucide-react";
import type { ReactorTool } from "@/components/ui/control-center-reactor";
import { WorkspaceToolbarContext } from "./workspace-toolbar-context";
import { WorkspaceQuickToolbar } from "./WorkspaceQuickToolbar";
import { WorkspaceDiscoverBanner } from "./WorkspaceDiscoverBanner";

// Danh sach chuc nang tinh cua toolbar - CHUA co onClick that (xem
// WorkspaceQuickToolbar.tsx: tool khong co onClick hien disabled that su,
// khong gia vo co chuc nang). Tool "Tao workspace" KHONG nam trong day vi no
// chi ton tai khi isSelf - xem dynamicTool ben duoi.
const staticTools: ReactorTool[] = [
  { id: "grid", label: "Bảng điều khiển", icon: LayoutGrid },
  { id: "trending", label: "Xu hướng", icon: TrendingUp },
  { id: "favorites", label: "Yêu thích", icon: Star },
  { id: "help", label: "Trợ giúp", icon: CircleHelp },
];

// Chrome RIENG cho MAN CHON WORKSPACE (WorkspaceSwitcher, page.tsx cua dung
// segment /workspace/[username]) - toolbar noi + banner duoi + context dang
// ky tool "Tao workspace". KHONG con chua anh nen o day nua - anh nen bau
// troi/dao noi gio dung CHUNG cho ca cay /workspace/[username]/** (xem
// layout.tsx cua chinh segment nay), rieng toolbar/banner van CHI danh cho
// man chon workspace nen dat o page.tsx (KHONG phai layout.tsx) de khong lo
// xuong man chi tiet workspace/doc bai - xem docs/engineering-log.md. Fragment
// (khong wrapping div) la du: page.tsx da nam trong div h-full cua layout.tsx
// cha, WorkspaceSwitcher (con truc tiep) van resolve size-full dung.
export function WorkspaceHubChrome({ children }: { children: React.ReactNode }) {
  const [dynamicTool, setDynamicTool] = useState<ReactorTool | null>(null);
  const tools = dynamicTool ? [dynamicTool, ...staticTools] : staticTools;

  return (
    <>
      <WorkspaceToolbarContext.Provider
        value={{ registerTool: setDynamicTool }}
      >
        {children}
      </WorkspaceToolbarContext.Provider>
      <WorkspaceQuickToolbar tools={tools} />
      <WorkspaceDiscoverBanner />
    </>
  );
}
