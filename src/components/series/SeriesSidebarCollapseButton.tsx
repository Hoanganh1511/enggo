"use client";

import { ChevronLeft } from "lucide-react";
import { useFocusModeStore } from "@/stores/focus-mode-store";

// Nut thu gon sidebar NAM NGAY TRONG panel (goc tren-phai, canh tieu de
// Series) - CHI hien khi Focus mode dang bat VA sidebar dang MO (yeu cau
// nguoi dung: "khi mà ở focus mode, mà bật sidebar seri ra nữa... thêm một
// button chevron left vào... Lúc này thì lại ẩn cái button 3 gạch lúc chưa
// mở đi" - nut tron 3-gach (SeriesFocusSidebar.tsx) gio CHI con lo phan
// "mở lại" luc dang thu gon, con "thu gọn" chuyen sang nut nay).
export function SeriesSidebarCollapseButton() {
  const focusModeActive = useFocusModeStore((s) => s.active);
  const collapsed = useFocusModeStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useFocusModeStore((s) => s.toggleSidebar);

  if (!focusModeActive || collapsed) return null;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Thu gọn mục lục series"
      title="Thu gọn mục lục series"
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
    >
      <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
