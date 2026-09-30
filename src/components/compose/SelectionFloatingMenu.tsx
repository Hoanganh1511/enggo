"use client";

import { useEffect, useRef, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { Palette, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, ArrowDownToLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// [2026-09-30] GOP "SelectionColorMenu" + "TableControlsMenu" (2 file rieng
// truoc day) thanh 1 component DUY NHAT - yeu cau nguoi dung: "Trong phần
// editor này có nhiều loại group buttons sẽ hiện lên khi select 1 vùng text
// để thao tác, bạn cần xác định rõ và đưa chúng thành cùng 1 thể loại, sau
// đấy khi hiện thị cần sắp xếp để hiển thị theo thứ tự, phân loại... chúng
// đè ẩn nhau hết rồi". Nguyen nhan cu: 2 BubbleMenu DOC LAP, MOI cai tu goi
// floating-ui rieng (position:absolute/fixed tinh RIENG cho tung cai) - khi
// CA HAI cung du dieu kien hien (bôi đen văn bản NGAY BEN TRONG 1 o bang, vd
// muon in đậm + tô màu chữ "Security Group"), ca 2 tinh CUNG 1 toa do
// "placement:top" quanh CUNG 1 vung chon, DE THANG len nhau/che khuat nhau -
// truoc day phai "chua chay" bang cach TAT HAN mau chu/nen khi dang o trong
// bang (`if (ed.isActive("table")) return false` trong SelectionColorMenu cu),
// nen nut chon mau BIEN MAT hoan toan luc o trong bang (dung bug nguoi dung
// vua bao "Cái button chọn màu khi tô đậm đâu rồi").
//
// Fix DUNG CACH: CHI 1 BubbleMenu (1 vi tri floating-ui DUY NHAT), NOI DUNG
// BEN TRONG tu quyet dinh hien PHAN NAO tuy ngu canh - khong con 2 instance
// canh tranh vi tri nua:
// - "Mau chu/nen" (tac dong LEN VAN BAN DANG CHON) - hien khi co 1 vung chon
//   VAN BAN THAT (khong rong, khong phai NodeSelection) - BAT KE co dang o
//   trong bang hay khong, dung y nguoi dung mo ta.
// - "Thao tac bang" (hang/cot/xoa bang - tac dong LEN CA BANG, khong rieng
//   vung dang chon) - hien khi con tro dang o trong 1 bang.
// Xep THEO THU TU CO Y (yeu cau "sắp xếp... theo thứ tự, phân loại"): mau
// chu/nen TRUOC (thao tac cuc bo, dung tren CHINH doan dang chon) roi moi
// den vach ngan + thao tac bang (thao tac PHAM VI RONG hon, ap dung ca bang) -
// 2 nhom CHI xuat hien CUNG LUC khi CA HAI dieu kien deu dung (bôi đen van
// ban NGAY TRONG 1 o bang), con lai (ngoai bang, hoac trong bang nhung
// khong bôi den gi) chi hien DUNG 1 nhom phu hop.
function appendToBody() {
  return document.body;
}

function shouldShowUnifiedMenu({ editor: ed, state }: { editor: Editor; state: EditorState }) {
  if (!ed.isEditable) return false;
  const { selection } = state;
  const hasTextSelection = !selection.empty && !(selection instanceof NodeSelection);
  return hasTextSelection || ed.isActive("table");
}

const BUBBLE_MENU_OPTIONS = { placement: "top" as const };

const TEXT_COLORS: { label: string; value: string | null }[] = [
  { label: "Mặc định", value: null },
  { label: "Đỏ", value: "#ef4444" },
  { label: "Cam", value: "#f97316" },
  { label: "Vàng", value: "#eab308" },
  { label: "Xanh lá", value: "#22c55e" },
  { label: "Xanh dương", value: "#3b82f6" },
  { label: "Tím", value: "#a855f7" },
];

const BG_COLORS: { label: string; value: string | null }[] = [
  { label: "Không nền", value: null },
  { label: "Vàng", value: "#fef9c3" },
  { label: "Xanh lá", value: "#dcfce7" },
  { label: "Xanh dương", value: "#dbeafe" },
  { label: "Đỏ", value: "#fee2e2" },
  { label: "Tím", value: "#f3e8ff" },
  { label: "Cam", value: "#ffedd5" },
];

function ColorSwatchRow({
  colors,
  activeValue,
  onPick,
}: {
  colors: { label: string; value: string | null }[];
  activeValue: string | null;
  onPick: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {colors.map((c) => (
        <button
          key={c.label}
          type="button"
          title={c.label}
          onClick={() => onPick(c.value)}
          className={cn(
            "flex size-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface transition-shadow duration-100 ease-out",
            activeValue === c.value && "ring-2 ring-ink",
          )}
          style={{ backgroundColor: c.value ?? "transparent" }}
        >
          {c.value === null && (
            <span
              className="pointer-events-none block size-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 4px)",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

function ColorSection({ editor }: { editor: Editor }) {
  let currentColor: string | null = null;
  let currentBg: string | null = null;
  try {
    currentColor = (editor.getAttributes("textStyle").color as string | undefined) ?? null;
    currentBg = (editor.getAttributes("textStyle").backgroundColor as string | undefined) ?? null;
  } catch {
    // bo qua, giu mac dinh null
  }

  const { from, to } = editor.state.selection;
  const selectionKey = `${from}:${to}`;
  const [panelOpen, setPanelOpen] = useState(false);
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey);
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey);
    setPanelOpen(false);
  }

  if (!panelOpen) {
    return (
      <button
        type="button"
        title="Chọn màu chữ/nền cho đoạn đang chọn"
        onMouseDown={(e) => {
          e.preventDefault();
          setPanelOpen(true);
        }}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover-bg hover:text-ink"
      >
        <Palette size={15} strokeWidth={1.9} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="w-9 shrink-0 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Chữ</span>
        <ColorSwatchRow
          colors={TEXT_COLORS}
          activeValue={currentColor}
          onPick={(value) => {
            const chain = editor.chain().focus();
            if (value) chain.setColor(value).run();
            else chain.unsetColor().run();
          }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-9 shrink-0 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Nền</span>
        <ColorSwatchRow
          colors={BG_COLORS}
          activeValue={currentBg}
          onPick={(value) => {
            const chain = editor.chain().focus();
            if (value) chain.setBackgroundColor(value).run();
            else chain.unsetBackgroundColor().run();
          }}
        />
      </div>
    </div>
  );
}

type ActiveHighlight = { el: HTMLElement; className: string };
type FoundCell = { table: HTMLTableElement; row: HTMLTableRowElement; cell: HTMLTableCellElement };

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

function TableSection({ editor }: { editor: Editor }) {
  const preview = useTableHoverPreview(editor);
  return (
    <div className="flex items-center gap-2" onMouseLeave={preview.clear}>
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
      <DeleteBtn
        label="Xoá cả bảng"
        solid
        onHoverStart={preview.previewTableDelete}
        onHoverEnd={preview.clear}
        onClick={() => editor.chain().focus().deleteTable().run()}
      />
    </div>
  );
}

export function SelectionFloatingMenu({ editor }: { editor: Editor }) {
  // [2026-09-30] An HOAN TOAN menu trong luc con dang KEO CHUOT de mo rong
  // vung chon (bug nguoi dung bao: "kéo tô đậm thêm 1 dòng nữa mà bị nó che
  // mất rồi") - BubbleMenu tinh lai vi tri LIEN TUC theo vung chon dang thay
  // doi tung khung hinh trong luc keo, "placement:top" co the dat CHINH GIUA
  // khu vuc nguoi dung dang co gang NHIN THAY de keo tiep, che khuat chinh
  // noi dung dang duoc chon. Theo doi mousedown (tren editor)/mouseup (tren
  // CA document, phong khi tha chuot NGOAI vung soan) qua state React THAT
  // (khong phai chi ref) de UNMOUNT han <BubbleMenu> trong luc keo - luc
  // mount lai (mouseup), BubbleMenuPlugin tu danh gia lai shouldShow NGAY
  // LAP TUC voi vung chon MOI NHAT (xem constructor cua BubbleMenuView goi
  // getShouldShow() + show() ngay luc khoi tao), khong can co gang "ep" 1
  // transaction rong (rong = selection khong doi = ProseMirror TU BO QUA,
  // khong lam gi ca).
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const dom = editor.view.dom;
    function onMouseDown() {
      setIsDragging(true);
    }
    function onMouseUp() {
      setIsDragging(false);
    }
    dom.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      dom.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [editor]);

  const { selection } = editor.state;
  const showColor = !selection.empty && !(selection instanceof NodeSelection);
  const showTable = editor.isActive("table");

  if (isDragging) return null;

  return (
    <BubbleMenu
      editor={editor}
      appendTo={appendToBody}
      className="z-50"
      options={BUBBLE_MENU_OPTIONS}
      shouldShow={shouldShowUnifiedMenu}
    >
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown">
        {showColor && <ColorSection editor={editor} />}
        {showColor && showTable && <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />}
        {showTable && <TableSection editor={editor} />}
      </div>
    </BubbleMenu>
  );
}
