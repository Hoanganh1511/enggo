"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// NodeView cua Accordion - CHI phuc vu luc SOAN (giu noi dung LUON hien de
// sua duoc du dang o trang thai dong/mo mac dinh nao, khac ban render TINH
// luc doc that qua <details> thuan tu dong an/hien theo attrs `open` - xem
// comment Accordion trong post-extensions.ts, cung tinh than "NodeView chi
// phuc vu preview/tuong tac luc soan" nhu QuestionPickerView/CuratedListView).
// Bam chevron o day CHI doi GIA TRI MAC DINH luc doc (attrs `open`), KHONG an
// noi dung luc dang soan.
export function AccordionView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const title = (node.attrs.title as string) ?? "";
  const open = node.attrs.open !== false;
  const canEdit = editor.isEditable;

  return (
    <NodeViewWrapper className="accordion-block my-4 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-2 px-3.5 py-2.5" contentEditable={false}>
        <button
          type="button"
          onClick={() => updateAttributes({ open: !open })}
          title={open ? "Mặc định: đang mở khi đọc" : "Mặc định: đang đóng khi đọc"}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
        >
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={cn("transition-transform duration-150", !open && "-rotate-90")}
          />
        </button>
        {canEdit ? (
          <input
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Tiêu đề accordion..."
            className="min-w-0 flex-1 bg-transparent text-[14.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
          />
        ) : (
          <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-ink">{title}</span>
        )}
      </div>
      <NodeViewContent className="accordion-body border-t border-border px-3.5 py-3" />
    </NodeViewWrapper>
  );
}
