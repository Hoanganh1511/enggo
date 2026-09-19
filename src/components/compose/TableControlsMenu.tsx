"use client";

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

function TableBtn({
  label,
  onClick,
  disabled,
  Icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  Icon: typeof Trash2;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
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
function DeleteBtn({ label, onClick, solid }: { label: string; onClick: () => void; solid?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  return (
    <BubbleMenu
      editor={editor}
      appendTo={appendToBody}
      className="z-50"
      options={BUBBLE_MENU_OPTIONS}
      shouldShow={shouldShowInsideTable}
    >
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown">
        <div className="flex items-center gap-0.5">
          <span className="px-1 text-[11px] font-medium text-ink-faint">Hàng</span>
          <TableBtn label="Chèn hàng phía trên" Icon={ArrowUpToLine} onClick={() => editor.chain().focus().addRowBefore().run()} />
          <TableBtn label="Chèn hàng phía dưới" Icon={ArrowDownToLine} onClick={() => editor.chain().focus().addRowAfter().run()} />
          <DeleteBtn label="Xoá hàng" onClick={() => editor.chain().focus().deleteRow().run()} />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        <div className="flex items-center gap-0.5">
          <span className="px-1 text-[11px] font-medium text-ink-faint">Cột</span>
          <TableBtn label="Chèn cột bên trái" Icon={ArrowLeftToLine} onClick={() => editor.chain().focus().addColumnBefore().run()} />
          <TableBtn label="Chèn cột bên phải" Icon={ArrowRightToLine} onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <DeleteBtn label="Xoá cột" onClick={() => editor.chain().focus().deleteColumn().run()} />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        {/* Xoá CA BANG - nut DAM (nen dac, khong chi vien/chu mau) de tach
            biet ro rang khoi 2 nut "Xoá hàng"/"Xoá cột" ben canh - day la
            thao tac PHAM VI RONG NHAT (mat het bang, khong chi 1 hang/cot),
            can trong luong thi giac cao hon han. */}
        <DeleteBtn label="Xoá cả bảng" solid onClick={() => editor.chain().focus().deleteTable().run()} />
      </div>
    </BubbleMenu>
  );
}
