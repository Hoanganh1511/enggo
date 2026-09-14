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
      {focusModeActive && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Mở mục lục series" : "Thu gọn mục lục series"}
          title={collapsed ? "Mở mục lục series" : "Thu gọn mục lục series"}
          className="fixed top-6 left-4 z-30 hidden size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-md transition-colors duration-150 ease-out hover:text-ink lg:flex"
        >
          <Menu size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <div className={cn(focusModeActive && collapsed && "lg:hidden")}>{children}</div>
    </>
  );
}
