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
      {/* [2026-09-14] Tung dung "lg:pl-16 khi Focus mode" (thay vi lg:pl-10)
          de nhuong cho nut tron toggle sidebar CO DINH. DA BO (2026-09-15) -
          Focus mode CHI TUNG bat tren trang Series Entry, va trang do LUON
          tu HUY padding nay qua "-mx-4 lg:-mx-10" cua chinh no ((read)/layout.tsx)
          bat ke gia tri padding la bao nhieu, nen doi rieng 16/10 o day KHONG
          he co tac dung hien thi nao - nguoc lai, lech 1 chieu (pl-16 nhung
          bleed van co dinh -mx-10) tao ra 1 khoang trang THUA 24px ben trai
          Focus mode (yeu cau nguoi dung: "bị thừa khoảng trắng bên trái").
          Nut tron da tu xu ly vi tri overlap rieng qua left-4/left-68 dong
          theo trang thai collapsed (xem SeriesFocusSidebar.tsx), khong can
          FeedMainArea can thiep nua. */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">{children}</div>
    </main>
  );
}
