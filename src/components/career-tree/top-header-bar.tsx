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
import NotificationBell from "./notification-bell";
import Logo from "@/components/ui/logo";

const TopHeaderBar = () => {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsed,
    getServerSnapshot,
  );

  const toggleCollapsed = () => setSidebarCollapsed(!isCollapsed);

  return (
    <header className="z-10 flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface px-3">
      {/* <div className="h-5 w-px shrink-0 bg-border" /> */}
      <button
        type="button"
        title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        onClick={toggleCollapsed}
        className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover

          `}
      >
        {isCollapsed ? (
          <PanelLeftOpen strokeWidth={1.75} className="size-4.5 2xl:size-5" />
        ) : (
          <PanelLeftClose strokeWidth={1.75} className="size-4.5 2xl:size-5" />
        )}
      </button>
      <AppSwitcherMenu />
      <div className="flex items-center">
        <Logo orientation="icon-only" size={22} className="shrink-0" />
        <span className="ml-2 text-white font-bold text-xs">Tree Career</span>
      </div>
      <div className="ml-auto flex items-center">
        <NotificationBell />
      </div>
    </header>
  );
};

export default TopHeaderBar;
