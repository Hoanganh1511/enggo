"use client";

import { useFocusModeStore } from "@/stores/focus-mode-store";

// Boc hang flex aside+content chinh cua trang Series ((read)/layout.tsx,
// Server Component - khong doc duoc Zustand) - CHI de tinh minHeight DUNG
// khi Focus mode dang bat: header ngang (TopHeaderBar.tsx) TU AN luc do
// (return null) nen KHONG con chiem "--header-height" nao ca, van tru bien
// nay ra khoi 100vh se lam hang flex THIEU dung DUNG bang chieu cao header
// (yeu cau nguoi dung: "cái chiều cao cũng không kéo full height viewport").
// Bleed ngang (-mx-4 lg:-mx-10) GIU CO DINH, khong lien quan focus mode -
// xem comment o FeedMainArea.tsx ve ly do khong con can doi rieng 16/10.
export function SeriesFocusRow({ children }: { children: React.ReactNode }) {
  const focusModeActive = useFocusModeStore((s) => s.active);
  return (
    <div
      className="-mx-4 -my-6 flex sm:-mx-6 lg:-mx-10"
      style={{ minHeight: focusModeActive ? "100vh" : "calc(100vh - var(--header-height))" }}
    >
      {children}
    </div>
  );
}
