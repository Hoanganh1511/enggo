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
  danger,
  Icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  Icon: typeof Trash2;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
        danger ? "text-danger hover:bg-danger/10" : "text-ink-muted hover:bg-hover-bg hover:text-ink",
      )}
    >
      <Icon size={15} strokeWidth={1.9} />
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
          <TableBtn label="Xoá hàng này" Icon={Trash2} danger onClick={() => editor.chain().focus().deleteRow().run()} />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        <div className="flex items-center gap-0.5">
          <span className="px-1 text-[11px] font-medium text-ink-faint">Cột</span>
          <TableBtn label="Chèn cột bên trái" Icon={ArrowLeftToLine} onClick={() => editor.chain().focus().addColumnBefore().run()} />
          <TableBtn label="Chèn cột bên phải" Icon={ArrowRightToLine} onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <TableBtn label="Xoá cột này" Icon={Trash2} danger onClick={() => editor.chain().focus().deleteColumn().run()} />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        <TableBtn label="Xoá cả bảng" Icon={Trash2} danger onClick={() => editor.chain().focus().deleteTable().run()} />
      </div>
    </BubbleMenu>
  );
}
