"use client";

import { useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  getServerSnapshot,
  getSidebarCollapsed,
  setSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/lib/career-tree/sidebar-collapsed-store";
import AppSwitcherMenu from "./app-switcher-menu";

const TopHeaderBar = () => {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsed,
    getServerSnapshot,
  );

  const toggleCollapsed = () => setSidebarCollapsed(!isCollapsed);

  return (
    <header className="z-10 flex h-12 shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        onClick={toggleCollapsed}
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        {isCollapsed ? (
          <PanelLeftOpen size={16} strokeWidth={1.75} />
        ) : (
          <PanelLeftClose size={16} strokeWidth={1.75} />
        )}
      </button>
      <AppSwitcherMenu />
    </header>
  );
};

export default TopHeaderBar;
