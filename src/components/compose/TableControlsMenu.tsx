"use client";

import { useRef } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, ArrowDownToLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Thanh dieu khien bang - yeu cau nguoi dung: "Table trong này chưa có các
// button bố trí hợp lý để tăng giảm số lượng cột, hàng, chèn, xóa" (truoc do
// CHI co 2 nut "Thêm hàng"/"Thêm cột" luon hien tren toolbar chinh, du chi
// dung duoc khi con tro dang o trong 1 bang - xem PostEditorToolbar.tsx).
// Dung BubbleMenu (giong tinh than SelectionColorMenu.tsx) thay vi nhoi them
// nut vao toolbar chinh - hien DUNG LUC/DUNG CHO (ngay canh bang dang sua),
// gom du 3 nhom thao tac: hang / cot / xoa ca bang.
//
// appendTo/options PHAI la reference ON DINH (hoisted ra ngoai component,
// khong phai arrow function/object literal moi moi lan render) - cung ly do
// da ghi trong SelectionColorMenu.tsx: SeriesEntryEditor dat
// shouldRerenderOnTransaction:true nen component nay re-render moi transaction,
// tham chieu doi lien tuc se lam effect noi bo cua BubbleMenu (floating-ui
// autoUpdate) huy+dung lai vong lap vo han ngay lan tao selection dau tien.
function appendToBody() {
  return document.body;
}

function shouldShowInsideTable({ editor: ed }: { editor: Editor }) {
  return ed.isEditable && ed.isActive("table");
}

const BUBBLE_MENU_OPTIONS = { placement: "top" as const };

type ActiveHighlight = { el: HTMLElement; className: string };
type FoundCell = { table: HTMLTableElement; row: HTMLTableRowElement; cell: HTMLTableCellElement };

// [2026-09-19] "Xem truoc" bang hover - yeu cau nguoi dung: "Khi tôi hover
// vào một tính năng trong này, bạn làm cho một animation nhấp nháy ở nơi nó
// sẽ xảy ra hành động đó" - rê chuot vao 1 nut la nhap nhay NGAY tai hang/
// cot/bang se bi anh huong, TRUOC khi bam that (mo ta hanh dong bang hinh
// anh thay vi chi doc chu). Dung DOM THAT cua bang (editor.view.dom la
// contentEditable that, khong phai ao) roi tu gan/go class CSS truc tiep
// (xem @keyframes tcm-* trong globals.css) - KHONG dung React state (moi
// lan hover se re-render ca BubbleMenu vo ich, trong khi day chi la hieu
// ung thi giac tam thoi, khong lien quan gi du lieu/props).
function useTableHoverPreview(editor: Editor) {
  const activeRef = useRef<ActiveHighlight[]>([]);

  function clear() {
    for (const { el, className } of activeRef.current) el.classList.remove(className);
    activeRef.current = [];
  }

  function apply(el: HTMLElement, className: string) {
    el.classList.add(className);
    activeRef.current.push({ el, className });
  }

  // Tim o/hang/bang THAT dang chua con tro - dung editor.view.domAtPos thay
  // vi doc lai vi tri chuot (con tro co the dang o BAT KY o nao trong bang,
  // khong nhat thiet o cho vua hover chuot - cac nut Them/Xoa hang-cot LUON
  // thao tac tren o dang co con tro, xem cac lenh addRowBefore()... o duoi).
  function findCurrentCell(): FoundCell | null {
    let domNode: Node;
    try {
      domNode = editor.view.domAtPos(editor.state.selection.from).node;
    } catch {
      return null;
    }
    const startEl = domNode.nodeType === Node.TEXT_NODE ? domNode.parentElement : (domNode as HTMLElement | null);
    const cell = startEl?.closest("td, th") as HTMLTableCellElement | null | undefined;
    const row = cell?.closest("tr") ?? null;
    const table = row?.closest("table") ?? null;
    if (!cell || !row || !table) return null;
    return { table, row, cell };
  }

  function previewRowEdge(edge: "top" | "bottom") {
    clear();
    const found = findCurrentCell();
    if (!found) return;
    apply(found.row, edge === "top" ? "tcm-edge-top" : "tcm-edge-bottom");
  }

  function previewRowDelete() {
    clear();
    const found = findCurrentCell();
    if (!found) return;
    Array.from(found.row.children).forEach((c) => apply(c as HTMLElement, "tcm-cell-flash-danger"));
  }

  function previewColumnEdge(edge: "left" | "right") {
    clear();
    const found = findCurrentCell();
    if (!found) return;
    const cellIndex = Array.from(found.row.children).indexOf(found.cell);
    found.table.querySelectorAll("tr").forEach((r) => {
      const c = r.children[cellIndex] as HTMLElement | undefined;
      if (c) apply(c, edge === "left" ? "tcm-edge-left" : "tcm-edge-right");
    });
  }

  function previewColumnDelete() {
    clear();
    const found = findCurrentCell();
    if (!found) return;
    const cellIndex = Array.from(found.row.children).indexOf(found.cell);
    found.table.querySelectorAll("tr").forEach((r) => {
      const c = r.children[cellIndex] as HTMLElement | undefined;
      if (c) apply(c, "tcm-cell-flash-danger");
    });
  }

  function previewTableDelete() {
    clear();
    const found = findCurrentCell();
    if (!found) return;
    apply(found.table, "tcm-table-flash-danger");
  }

  return { clear, previewRowEdge, previewRowDelete, previewColumnEdge, previewColumnDelete, previewTableDelete };
}

function TableBtn({
  label,
  onClick,
  onHoverStart,
  onHoverEnd,
  disabled,
  Icon,
}: {
  label: string;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  disabled?: boolean;
  Icon: typeof Trash2;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon size={15} strokeWidth={1.9} />
    </button>
  );
}

// Nut xoa CO CHU (khac 3 nut them hang/cot chi can icon mui ten la du ro
// nghia) - yeu cau nguoi dung: "3 cái icon xóa nhìn không tách biệt. Tôi cần
// sự rõ ràng" (truoc do ca 3 nut Xoá hàng/Xoá cột/Xoá cả bảng deu CHI la 1
// icon Trash2 giong het nhau, khac biet DUY NHAT nam o thuoc tinh `title`
// (chi hien khi RE chuot vao, khong nhin thay ngay duoc) - nen luon hien
// CHU canh icon, khong dua vao tooltip nua.
function DeleteBtn({
  label,
  onClick,
  onHoverStart,
  onHoverEnd,
  solid,
}: {
  label: string;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  solid?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium whitespace-nowrap transition-colors duration-150 ease-out",
        solid ? "bg-danger text-white hover:opacity-85" : "text-danger hover:bg-danger/10",
      )}
    >
      <Trash2 size={13} strokeWidth={2} />
      {label}
    </button>
  );
}

export function TableControlsMenu({ editor }: { editor: Editor }) {
  const preview = useTableHoverPreview(editor);

  return (
    <BubbleMenu
      editor={editor}
      appendTo={appendToBody}
      className="z-50"
      options={BUBBLE_MENU_OPTIONS}
      shouldShow={shouldShowInsideTable}
    >
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown" onMouseLeave={preview.clear}>
        <div className="flex items-center gap-0.5">
          <span className="px-1 text-[11px] font-medium text-ink-faint">Hàng</span>
          <TableBtn
            label="Chèn hàng phía trên"
            Icon={ArrowUpToLine}
            onHoverStart={() => preview.previewRowEdge("top")}
            onHoverEnd={preview.clear}
            onClick={() => editor.chain().focus().addRowBefore().run()}
          />
          <TableBtn
            label="Chèn hàng phía dưới"
            Icon={ArrowDownToLine}
            onHoverStart={() => preview.previewRowEdge("bottom")}
            onHoverEnd={preview.clear}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
          <DeleteBtn
            label="Xoá hàng"
            onHoverStart={preview.previewRowDelete}
            onHoverEnd={preview.clear}
            onClick={() => editor.chain().focus().deleteRow().run()}
          />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        <div className="flex items-center gap-0.5">
          <span className="px-1 text-[11px] font-medium text-ink-faint">Cột</span>
          <TableBtn
            label="Chèn cột bên trái"
            Icon={ArrowLeftToLine}
            onHoverStart={() => preview.previewColumnEdge("left")}
            onHoverEnd={preview.clear}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          />
          <TableBtn
            label="Chèn cột bên phải"
            Icon={ArrowRightToLine}
            onHoverStart={() => preview.previewColumnEdge("right")}
            onHoverEnd={preview.clear}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
          <DeleteBtn
            label="Xoá cột"
            onHoverStart={preview.previewColumnDelete}
            onHoverEnd={preview.clear}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        {/* Xoá CA BANG - nut DAM (nen dac, khong chi vien/chu mau) de tach
            biet ro rang khoi 2 nut "Xoá hàng"/"Xoá cột" ben canh - day la
            thao tac PHAM VI RONG NHAT (mat het bang, khong chi 1 hang/cot),
            can trong luong thi giac cao hon han. */}
        <DeleteBtn
          label="Xoá cả bảng"
          solid
          onHoverStart={preview.previewTableDelete}
          onHoverEnd={preview.clear}
          onClick={() => editor.chain().focus().deleteTable().run()}
        />
      </div>
    </BubbleMenu>
  );
}
