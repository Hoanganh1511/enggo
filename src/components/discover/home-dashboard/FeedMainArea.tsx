"use client";

import { cn } from "@/lib/utils";
import { useDashboardSidebarCollapseStore } from "@/stores/dashboard-sidebar-collapse-store";

// Tach rieng khoi (feed)/layout.tsx (truoc day la 1 <main> tinh ngay trong
// server component) vi padding-left phai PHAN UNG theo trang thai thu gon
// cua HomeDashboardSidebar (client state, xem dashboard-sidebar-collapse-store.ts) -
// server component khong doc duoc zustand store luc render.
export function FeedMainArea({ children }: { children: React.ReactNode }) {
  const collapsed = useDashboardSidebarCollapseStore((s) => s.collapsed);

  return (
    <main
      className={cn(
        "relative z-10 py-6 transition-[padding-left] duration-200 ease-out",
        collapsed ? "lg:pl-0" : "lg:pl-61",
      )}
    >
      {/* Container chung cho BODY cua moi trang trong nhom (feed) - xem comment
          goc truoc day trong (feed)/layout.tsx ve ly do 1 cho duy nhat. */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">{children}</div>
    </main>
  );
}
