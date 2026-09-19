"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

type HeadingLevel = 2 | 3 | 4;
type HeadingItem = { level: HeadingLevel; text: string; pos: number };

// Quet TOAN BO doc lay heading H2/H3/H4 THEO DUNG THU TU xuat hien - dung
// tinh than insertToc()/insertQuestionPicker() trong PostEditorToolbar.tsx
// (cung quet H2 tu editor.state.doc), khac o cho: TOC nay la 1 PANEL LUON
// HIEN o canh, TU CAP NHAT lai MOI LAN render (SeriesEntryEditor.tsx da dat
// shouldRerenderOnTransaction:true nen component nay von da re-render tren
// moi transaction - tinh lai o day la RE, khong can them listener/state
// rieng), khong phai 1 khoi CHEN 1 LAN roi dung yen nhu TocBlock.
function collectHeadings(editor: Editor): HeadingItem[] {
  const items: HeadingItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    const level = node.attrs.level as number | undefined;
    if (node.type.name === "heading" && (level === 2 || level === 3 || level === 4)) {
      items.push({ level, text: node.textContent.trim() || "(chưa có tiêu đề)", pos });
    }
  });
  return items;
}

const LEVEL_INDENT: Record<HeadingLevel, string> = {
  2: "pl-2.5",
  3: "pl-5.5",
  4: "pl-8.5",
};

// Panel "Mục lục" (H2 > H3 > H4) - yeu cau nguoi dung: "Chưa thêm 1 phần
// diện tích bên phải để hiện cho TOC nữa" (sau khi bo cot Live preview cu -
// xem SeriesEntryForm.tsx - nguoi dung muon dung lai khoang trong ben phai
// do cho 1 tinh nang KHAC: muc luc, khong phai preview). `fixed` (khong phai
// sticky/nam trong flex row voi form) - DON GIAN HON: khong can restructure
// lai layout 1 cot hien tai cua SeriesEntryForm.tsx thanh 2 cot chi de danh
// cho 1 panel nho ~224px, neo THANG vao goc phai man hinh nhu cach box nut
// Luu/Preview o cuoi trang da lam (xem "fixed right-6 bottom-6" o do). Neo
// CA top LAN bottom (thay vi 1 max-height co dinh) de KHONG BAO GIO de len
// box nut do, tu dieu chinh chieu cao cuon noi bo theo khong gian con lai
// giua header va box nut.
export function EntryHeadingsToc({ editor }: { editor: Editor }) {
  const headings = collectHeadings(editor);

  return (
    <nav
      aria-label="Mục lục bài viết"
      className="fixed top-28 right-6 bottom-24 z-40 hidden w-56 overflow-y-auto xl:block"
    >
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Mục lục</p>
      {headings.length === 0 ? (
        <p className="text-[12.5px] text-ink-faint">Chưa có tiêu đề H2/H3/H4 nào trong bài.</p>
      ) : (
        <ul className="flex flex-col gap-0.5 border-l border-border">
          {headings.map((h, i) => (
            <li key={i} className="-ml-px">
              <button
                type="button"
                title={h.text}
                onClick={() => editor.chain().focus(h.pos + 1).scrollIntoView().run()}
                className={cn(
                  "block w-full cursor-pointer truncate border-l-2 border-transparent py-0.5 text-left text-[12.5px] text-ink-muted transition-colors duration-150 ease-out hover:border-ink-faint hover:text-ink",
                  LEVEL_INDENT[h.level],
                  h.level === 2 && "font-semibold text-ink",
                )}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
