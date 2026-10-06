"use client";

import { BookOpen } from "lucide-react";
import { useNotesStore } from "@/stores/notes-store";
import { NotesPanel } from "./NotesPanel";

// Nut mo panel "My Notes" - CHIEM DUNG vi tri cu cua nut "Lên đầu trang"
// (SeriesScrollToTopButton.tsx da doi len bottom-20 de nhuong cho), LUON
// hien (khong an/hien theo scroll nhu nut do) - yeu cau nguoi dung: "Bổ
// sung thêm 1 button thay thế vị trí nút Scroll To Top hiện tại, nút Scroll
// To Top nếu hiện ra sẽ nằm ở phía trên nó". Mount CHUNG voi NotesPanel
// (ca 2 cung o cap layout.tsx - Overview + moi Entry trong 1 Series) de chi
// can 1 dong import duy nhat ben layout.
export function SeriesNotesLauncher() {
  const { togglePanel } = useNotesStore();
  return (
    <>
      <button
        type="button"
        aria-label="Mở My Notes"
        onClick={togglePanel}
        className="fixed right-6 bottom-6 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-lg transition-all duration-200 ease-out hover:border-border-strong hover:text-ink"
      >
        <BookOpen size={18} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <NotesPanel />
    </>
  );
}
