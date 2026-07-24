"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/lib/career-tree/sidebar-collapsed-store";

// layout.tsx la Server Component (can giu vay de Suspense/CurrentUser/auth()
// khong mat request context - xem ghi chu trong layout.tsx) nen khong the
// tu doc isCollapsed (can hook) de tinh margin-left ne Sidebar "fixed"
// ngay tai do - tach rieng wrapper client nho nay chi lam 1 viec: dong bo
// margin-left voi Sidebar/TopHeaderBar (ca 3 cung doc chung 1
// sidebar-collapsed-store de khong bao gio lech nhau khi dong/mo).
const MainContentArea = ({ children }: { children: React.ReactNode }) => {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsed,
    getServerSnapshot,
  );

  return (
    <div
      className={`min-h-0 flex-1 overflow-auto py-4 px-6 transition-[margin] duration-200 ${
        isCollapsed ? "ml-16" : "ml-66"
      }`}
    >
      {children}
    </div>
  );
};

export default MainContentArea;
