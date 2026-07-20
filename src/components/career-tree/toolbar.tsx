"use client";

import { Search } from "lucide-react";
import WorkspaceSwitcher from "./workspace-switcher";
import type { ApiWorkspace } from "@/lib/api/types";

type ToolbarProps = {
  onOpenSearch: () => void;
  workspace: ApiWorkspace;
  workspaces: ApiWorkspace[];
};

const Toolbar = ({ onOpenSearch, workspace, workspaces }: ToolbarProps) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-sm border border-border p-1 2xl:p-1.5">
      <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} />
      <div className="h-5 w-px bg-border" />
      <button
        type="button"
        onClick={onOpenSearch}
        title="Tìm kiếm node (Ctrl+K)"
        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 text-[12px] 3xl:text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
      >
        <Search size={16} strokeWidth={1.75} />
        Tìm kiếm
        <kbd className="ml-1 rounded border border-border px-1.5 py-0.5 text-[10px] leading-none text-ink-muted">
          Ctrl K
        </kbd>
      </button>
    </div>
  );
};

export default Toolbar;
