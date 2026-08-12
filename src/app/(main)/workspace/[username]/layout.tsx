"use client";

import { useState } from "react";
import { CircleHelp, SunMoon } from "lucide-react";
import StarfieldBackground from "@/components/background/StarfieldBackground";
import {
  ControlCenterReactor,
  type ReactorTool,
} from "@/components/ui/control-center-reactor";
import { WorkspaceToolbarContext } from "@/components/workspaces/workspace-toolbar-context";

// Danh sach chuc nang tinh cua toolbar - component tu no da lo phan
// deploy/retract + toast "{label} đã sẵn sàng", chi can truyen tools that
// (xem control-center-reactor.tsx). Tool "Tao workspace" KHONG nam trong
// day vi no chi ton tai khi isSelf - xem dynamicTool ben duoi.
const staticTools: ReactorTool[] = [
  { id: "theme", label: "Đổi giao diện", icon: SunMoon, tone: "cyan" },
  { id: "guide", label: "Hướng dẫn", icon: CircleHelp, tone: "violet" },
];

const WorkspaceHubLayout = ({ children }: { children: React.ReactNode }) => {
  // Tool dong duy nhat hien tai: "Tao workspace", do WorkspaceSwitcher (con
  // cua children) tu dang ky qua context khi isSelf - xem
  // workspace-toolbar-context.tsx de biet ly do can context thay vi prop.
  const [dynamicTool, setDynamicTool] = useState<ReactorTool | null>(null);
  const tools = dynamicTool ? [...staticTools, dynamicTool] : staticTools;

  return (
    // h-full: WorkspaceSwitcher tu no dung "size-full" (mong 100% chieu cao
    // cha) de choan het vung noi dung - thieu class nay thi cha (div tran,
    // khong dat height) tinh height:auto, khien height:100% cua con bi quy
    // ve "auto" (theo spec CSS), lam trang co lai bang dung noi dung thay vi
    // choan het MainContentArea nhu 1 trang binh thuong.
    <div className="relative h-full">
      <StarfieldBackground />
      <WorkspaceToolbarContext.Provider
        value={{ registerTool: setDynamicTool }}
      >
        <div className="relative z-10 h-full">{children}</div>
      </WorkspaceToolbarContext.Provider>
      <ControlCenterReactor tools={tools} />
    </div>
  );
};

export default WorkspaceHubLayout;
