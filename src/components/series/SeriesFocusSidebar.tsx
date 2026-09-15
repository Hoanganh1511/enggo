"use client";

import { Menu } from "lucide-react";
import { useFocusModeStore } from "@/stores/focus-mode-store";
import { cn } from "@/lib/utils";

// Boc <aside> that (SeriesSidebar/lien ket "Tất cả series"...) da render san
// tu Server Component (children) - CHI them 2 thu: 1 nut TRON co dinh (icon 3
// thanh ngang) hien khi Focus mode dang bat de bat/tat thu gon, va an
// <aside> qua CSS (khong go khoi DOM) khi dang thu gon - giu nguyen toan bo
// noi dung/logic that cua sidebar khong doi, khong phai viet lai.
export function SeriesFocusSidebar({ children }: { children: React.ReactNode }) {
  const focusModeActive = useFocusModeStore((s) => s.active);
  const collapsed = useFocusModeStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useFocusModeStore((s) => s.toggleSidebar);

  return (
    <>
      {/* CHI hien khi dang THU GON (yeu cau nguoi dung: "Lúc này thì lại ẩn
          cái button 3 gạch lúc chưa mở đi") - luc DA MO, nut mo/dong chuyen
          sang dang chevron-left NAM NGAY TRONG sidebar (xem
          SeriesSidebarCollapseButton.tsx trong layout.tsx), khong con can
          nut tron noi rieng nay nua. */}
      {focusModeActive && collapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Mở mục lục series"
          title="Mở mục lục series"
          className="fixed top-6 left-4 z-30 hidden size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-md transition-colors duration-150 ease-out hover:text-ink lg:flex"
        >
          <Menu size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      {/* flex (khong phai div thuong) - QUAN TRONG: lop boc nay chen giua
          <aside> that va hang flex ngoai cung (layout.tsx), lam <aside> KHONG
          con la flex-item TRUC TIEP nua nen mat luon "align-items: stretch"
          mac dinh (truoc day <aside> tu cao BANG cot noi dung ben canh dung
          co che nay, khong can h-full rieng) - nen gay nen mau xam cua sidebar
          bi "cut cut" ngang chung noi dung cua no, khong keo dai het trang
          nhu cot noi dung dai hon (nguoi dung bao loi). Bon "flex" o day de
          lop boc tu stretch <aside> con TRONG NO len bang chinh chieu cao cua
          no (da duoc outer flex stretch dung), khoi phuc lai hanh vi cu. */}
      <div className={cn("flex", focusModeActive && collapsed && "lg:hidden")}>{children}</div>
    </>
  );
}
