"use client";

import { useCareerTree } from "@/lib/career-tree/career-tree-context";
import Toolbar from "./toolbar";
import WorkspaceInfoBar from "./workspace-info-bar";
import type { ApiWorkspace } from "@/lib/api/types";

type CanvasTopbarProps = {
  workspace: ApiWorkspace;
  workspaces: ApiWorkspace[];
};

// Chỉ phần cần tương tác client (mở CommandPalette, đọc allNodes đang sống để
// số liệu tổng quan tự cập nhật theo thời gian thực) mới cần "use client" —
// workspace/workspaces đã được @topbar/page.tsx fetch sẵn ở server, truyền
// xuống đây qua props, không cần fetch lại lần nữa.
const CanvasTopbar = ({ workspace, workspaces }: CanvasTopbarProps) => {
  const { allNodes, setIsPaletteOpen } = useCareerTree();

  return (
    <header className="border-b border-border bg-surface p-2.5">
      <div className="flex items-center justify-between">
        <Toolbar
          onOpenSearch={() => setIsPaletteOpen(true)}
          workspace={workspace}
          workspaces={workspaces}
        />
        <div>
          <WorkspaceInfoBar workspace={workspace} nodes={allNodes} />
        </div>
      </div>
    </header>
  );
};

export default CanvasTopbar;
