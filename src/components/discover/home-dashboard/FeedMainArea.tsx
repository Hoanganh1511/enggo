"use client";

import { useFocusModeStore } from "@/stores/focus-mode-store";
import { cn } from "@/lib/utils";

// Boc <main> cua (feed)/layout.tsx (Server Component, khong doc duoc Zustand
// truc tiep) - CHI tach rieng phan can doc focus-mode-store: bo padding trai
// lg:pl-61 (danh cho HomeDashboardSidebar) khi dang Focus mode, vi luc do
// HomeDashboardSidebar.tsx tu an (return null) nen khong con chiem cho nua -
// giu nguyen padding do se de lai 1 khoang trong vo nghia ben trai.
export function FeedMainArea({ children }: { children: React.ReactNode }) {
  const focusModeActive = useFocusModeStore((s) => s.active);

  return (
    <main className={cn("relative z-10 py-6", !focusModeActive && "lg:pl-61")}>
      {/* lg:pl-16 (thay vi lg:pl-10 mac dinh) khi Focus mode - nhuong cho nut
          tron toggle sidebar CO DINH cua SeriesFocusSidebar.tsx (fixed
          top-6 left-4, size-10 => choan toi ~left:56px) de KHONG bi noi
          dung (vd breadcrumb dau trang Series Entry) de len tren - yeu cau
          nguoi dung sau khi thay bi de: "tăng thêm padding left cho phần
          chính để không bị đè nút collapse lên". */}
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:pr-10",
          focusModeActive ? "lg:pl-16" : "lg:pl-10",
        )}
      >
        {children}
      </div>
    </main>
  );
}
