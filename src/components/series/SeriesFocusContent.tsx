"use client";

import { useFocusModeStore } from "@/stores/focus-mode-store";
import { cn } from "@/lib/utils";

// Boc cot noi dung chinh ((read)/layout.tsx, Server Component - khong doc
// duoc Zustand) - CHI de them padding-top RIENG luc nut tron mo lai sidebar
// (SeriesFocusSidebar.tsx, "fixed top-6 left-4 size-10 ... lg:flex") dang
// hien: nut nay LUON fixed theo VIEWPORT, khong nam trong luong trang nen
// KHONG tu day noi dung xuong - luc Focus mode AN header ngang, noi dung
// (breadcrumb cua EntryHeader) truot len sat dinh trang, chiem DUNG vi tri
// nut tron dang dung, de len nhau (nguoi dung bao: "Cái nút này lại bị đè
// lên rồi"). lg:pt-20 (thay vi lg:p-10 mac dinh) danh rieng khoang trong DU
// cho nut (top-6 + size-10 = het khoang 4rem tinh tu dinh) + 1 chut dem.
export function SeriesFocusContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const focusModeActive = useFocusModeStore((s) => s.active);
  const collapsed = useFocusModeStore((s) => s.sidebarCollapsed);
  const needsRoomForToggle = focusModeActive && collapsed;

  return (
    <div
      className={cn(
        "min-w-0 flex-1 bg-surface p-6 lg:p-10",
        needsRoomForToggle && "lg:pt-20",
      )}
    >
      {children}
    </div>
  );
}
