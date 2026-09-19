"use client";

import { useState } from "react";
import { Grip, Copy, Trash2 } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Nut "..." dang luoi cham (Grip) hien khi RE CHUOT vao 1 khoi tuy chinh
// (Accordion/Grid/CardGrid/SplitBlock/ProfileBlock/StatAccordion/FlowDiagram/
// QuestionPicker/CuratedList...) - yeu cau nguoi dung: "với mỗi loại element
// được insert vào từ editor, khi hover, chúng đều có một button icon dạng
// grid dots, khi click vào sẽ có các options như: xóa, copy cả khối đó".
//
// Component DOC LAP (chi nhan editor/getPos/node THUAN, khong biet gi ve
// loai khoi cu the) - moi NodeView tu dat no vao vi tri phu hop (thuong o
// gan chevron/header cua chinh no) VA tu them class "group relative" len
// NodeViewWrapper de :hover kich hoat dung "group-hover:opacity-100" o day.
// Xoa/Nhan doi dung THANG 1 transaction ProseMirror qua vi tri THAT cua
// chinh node nay (getPos()) - hoat dong ĐỒNG NHAT cho MOI loai node (khong
// can biet no la atom hay co content that), KHONG dua vao lenh rieng cua
// tung schema.
export function BlockActionsMenu({
  editor,
  getPos,
  node,
  className,
}: {
  editor: Editor;
  getPos: () => number | undefined;
  node: ProseMirrorNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!editor.isEditable) return null;

  function handleDuplicate() {
    const pos = getPos();
    if (pos === undefined) return;
    // node.toJSON() - snapshot DAY DU (type + attrs + content that, ke ca
    // Accordion/Grid/SplitBlock/ProfileBlock co ProseMirror children THAT
    // ben trong, khong chi cac node atom don gian) - chen NGAY SAU vi tri
    // KET THUC cua chinh node nay (pos + node.nodeSize).
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, node.toJSON())
      .run();
    setOpen(false);
  }

  function handleDelete() {
    const pos = getPos();
    if (pos === undefined) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run();
    setOpen(false);
  }

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          contentEditable={false}
          title="Tuỳ chọn khối"
          className={cn(
            "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint opacity-0 transition-opacity duration-150 ease-out hover:bg-hover-bg hover:text-ink group-hover:opacity-100",
            open && "opacity-100",
            className,
          )}
        >
          <Grip size={14} strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="end" sideOffset={4} className="z-50 w-44 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
        <button
          type="button"
          onClick={handleDuplicate}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink hover:bg-hover-bg"
        >
          <Copy size={14} strokeWidth={2} className="text-ink-faint" />
          Nhân đôi khối
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-danger hover:bg-hover-bg"
        >
          <Trash2 size={14} strokeWidth={2} />
          Xoá khối
        </button>
      </PopoverContent>
    </PopoverRoot>
  );
}
