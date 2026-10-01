"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { BookOpen } from "lucide-react";
import { BlockActionsMenu } from "./BlockActionsMenu";

// PrereqBlock - "cần biết trước khi đọc tiếp" (xem comment day du o dinh
// nghia node trong post-extensions.ts). [2026-10-01 redesign] Chi con la 1
// "khung goi ngoai" (icon + nhan header, contentEditable=false) bao quanh
// NodeViewContent THAT (soan rich text tu do, giong het pattern AccordionView/
// ProfileBlockView) - yeu cau nguoi dung: "Không làm dạng area như này. Tôi
// muốn biên soạn bình thường. Chỉ cần phần gói ngoài là được rồi".
export function PrereqBlockView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const title = (node.attrs.title as string) || "";

  return (
    <NodeViewWrapper className="prereq-block group relative">
      <div className="prereq-header" contentEditable={false}>
        <BookOpen size={13} strokeWidth={2} className="prereq-header-icon shrink-0" aria-hidden="true" />
        {canEdit ? (
          <input
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Nhãn đầu khối (vd: Cần biết trước khi đọc tiếp)"
            className="prereq-header-label min-w-0 flex-1 border-none bg-transparent p-0 outline-none placeholder:text-ink-faint"
          />
        ) : (
          <span className="prereq-header-label">{title}</span>
        )}
        {canEdit && <BlockActionsMenu editor={editor} getPos={getPos} node={node} className="ml-auto" />}
      </div>
      <NodeViewContent className="prereq-body" />
    </NodeViewWrapper>
  );
}
