"use client";

import { useSyncExternalStore } from "react";
import { Home, LayoutGrid, Settings } from "lucide-react";
import {
  getServerSnapshot,
  getSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/lib/career-tree/sidebar-collapsed-store";

const NAV_ITEMS = [
  { title: "Trang chủ", icon: Home },
  { title: "Bảng", icon: LayoutGrid },
  { title: "Cài đặt", icon: Settings },
];

const Sidebar = () => {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsed,
    getServerSnapshot,
  );

  return (
    <nav
      className={`z-10 flex shrink-0 flex-col gap-1 bg-white/90 py-3 ring-1 ring-black/15 transition-[width] duration-200 dark:bg-zinc-900/90 dark:ring-white/10 ${
        isCollapsed ? "w-16 items-center" : "w-80"
      }`}
    >
      <div className="px-2">
        {NAV_ITEMS.map(({ title, icon: Icon }) => (
          <button
            key={title}
            type="button"
            title={title}
            className={`flex h-10 shrink-0 cursor-pointer items-center rounded-sm gap-1 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${
              isCollapsed ? "w-10 justify-center" : "w-full px-2"
            }`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon size={16} strokeWidth={1.75} className="shrink-0" />
            </div>

            {!isCollapsed && (
              <span className="flex-1 text-left truncate font-medium text-sm">
                {title}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
