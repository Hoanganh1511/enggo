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
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">{children}</div>
    </main>
  );
}
