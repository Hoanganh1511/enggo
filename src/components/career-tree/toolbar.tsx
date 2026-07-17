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
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200  px-2 py-1.5 dark:border-zinc-700 ">
      <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} />
      <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
      <button
        type="button"
        onClick={onOpenSearch}
        title="Tìm kiếm node (Ctrl+K)"
        className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Search size={16} strokeWidth={1.75} />
        Tìm kiếm
        <kbd className="ml-1 rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] leading-none text-zinc-400 dark:border-zinc-600">
          Ctrl K
        </kbd>
      </button>
    </div>
  );
};

export default Toolbar;
