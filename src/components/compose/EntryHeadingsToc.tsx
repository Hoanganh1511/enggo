"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

type HeadingLevel = 2 | 3 | 4;
type HeadingItem = { level: HeadingLevel; text: string; pos: number };

// Quet TOAN BO doc lay heading H2/H3/H4 THEO DUNG THU TU xuat hien - dung
// tinh than insertToc()/insertQuestionPicker() trong PostEditorToolbar.tsx
// (cung quet H2 tu editor.state.doc).
//
// [2026-09-20 fix hieu nang] TRUOC DAY tinh lai TRUC TIEP trong render (dua
// vao SeriesEntryEditor.tsx dat shouldRerenderOnTransaction:true) - nghia la
// MOI LAN component nay re-render (tuc la MOI transaction, KE CA transaction
// CHI DOI SELECTION nhu di chuyen con tro/bam chuot, khong doi noi dung gi
// ca) deu quet lai TOAN BO document. Voi bai viet dai/nhieu heading, day la
// 1 vong quet O(n) chay LIEN TUC tren MOI ky tu go BAT KY dau trong tai
// lieu, khong chi noi dang go - nguoi dung hoi "nếu nội dung lớn, nhiều
// element thì nó lag phải k". Sua bang cach chuyen sang state + subscribe
// `editor.on("update", ...)` (chi bao khi NOI DUNG THAT SU thay doi, KHONG
// bao khi chi doi selection - khac voi re-render cua ca component me) +
// debounce nhe (200ms) - vua giam so lan quet xuong CHI khi noi dung dung
// thay doi, vua gop nhieu lan go lien tuc (vd go nhanh 1 tu) thanh 1 lan
// quet duy nhat sau khi nguoi dung tam ngung, thay vi quet lai SAU TUNG ky
// tu. Danh doi: TOC cham hon noi dung dung 200ms (khong nhan ra duoc bang
// mat thuong) de doi lay khong con quet toan bo tai lieu tren moi transaction.
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
export function EntryHeadingsToc({ editor, disabled = false }: { editor: Editor; disabled?: boolean }) {
  const [headings, setHeadings] = useState<HeadingItem[]>(() => collectHeadings(editor));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // KHONG goi setHeadings() ngay dau effect - lazy initializer cua
    // useState() o tren da lo san lan tinh DAU TIEN (luc mount); goi them o
    // day se bi coi la "setState dong bo trong effect" (react-hooks/set-state-in-effect),
    // du KHONG sai ve logic (editor la 1 prop on dinh, hau nhu khong doi
    // identity) nhung khong can thiet.
    function scheduleUpdate() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setHeadings(collectHeadings(editor));
      }, 200);
    }

    // "update" (KHONG phai "selectionUpdate"/"transaction") - CHI bao khi
    // NOI DUNG tai lieu thuc su thay doi (go chu, chen/xoa khoi...), tu
    // dong bo qua cac transaction chi doi vi tri con tro/bam chuot chon
    // vung - dung chinh xac dieu kien "content thuc su thay doi" ma khong
    // can tu kiem tra sai khac gi ca.
    editor.on("update", scheduleUpdate);
    return () => {
      editor.off("update", scheduleUpdate);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [editor]);

  return (
    // [2026-09-20 fix #2] Lan truoc ha z-index (z-30, thap hon z-40 cua
    // LayoutSpinnerOverlay) tuong la du - VAN sai, nguoi dung bao lai kem
    // anh chup y het loi cu ("Lớp phủ loading tại sao không che hết?"): panel
    // nay la `fixed` NEO THANG VAO MAN HINH, con LayoutSpinnerOverlay lai la
    // `absolute inset-0` bam theo KICH THUOC HOP cua to tien "relative"
    // (SeriesEntryForm.tsx) - hop do CHUA CHAC vuon toi dung vi tri man hinh
    // noi panel nay dang neo (vd neu to tien do hep hon vung TOC dang chiem),
    // nen DU z-index thap hon, 2 phan tu co the don gian KHONG HE CHONG NHAU
    // tren man hinh de che duoc - day la van de HINH HOC (khong gian phu), khong
    // phai thu tu ve (z-index). Sua DUNG GOC: nhan THANG trang thai `saving`
    // tu SeriesEntryForm.tsx (qua SeriesEntryEditor.tsx) va TU lam mo/khoa
    // chinh no khi dang luu - hoan toan doc lap voi hinh dang/vi tri cua
    // LayoutSpinnerOverlay, khong con phu thuoc 2 phan tu co "gap nhau" tren
    // man hinh hay khong.
    <nav
      aria-label="Mục lục bài viết"
      aria-hidden={disabled}
      className={cn(
        "fixed top-28 right-6 bottom-24 z-30 hidden w-56 overflow-y-auto transition-opacity duration-150 ease-out xl:block",
        disabled && "pointer-events-none opacity-40 blur-[1.5px]",
      )}
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
