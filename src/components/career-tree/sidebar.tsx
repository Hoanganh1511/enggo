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
      className={`z-10 flex shrink-0 flex-col gap-1 border-r border-border bg-surface py-3 transition-[width] duration-200 ${
        isCollapsed ? "w-16 items-center" : "w-50 3xl:w-80"
      }`}
    >
      <div className="px-2">
        {NAV_ITEMS.map(({ title, icon: Icon }) => (
          <button
            key={title}
            type="button"
            title={title}
            className={`flex h-9 3xl:h-10 shrink-0 cursor-pointer items-center rounded-sm gap-1 text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover ${
              isCollapsed ? "w-10 justify-center" : "w-full px-2"
            }`}
          >
            <div className="flex size-5 3xl:size-6 shrink-0 items-center justify-center">
              <Icon strokeWidth={1.75} className="size-4 3xl:size-5 shrink-0" />
            </div>

            {!isCollapsed && (
              <span className="flex-1 text-left truncate font-medium text-[13px] 3xl:text-sm text-ink">
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
