"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { BlockActionsMenu } from "./BlockActionsMenu";

// NodeView TOI THIEU cho SplitBlock - CHI de co cho dat BlockActionsMenu
// (yeu cau nguoi dung: "với mỗi loại element được insert vào từ editor, khi
// hover... button icon dạng grid dots... xóa, copy cả khối"). Truoc do
// SplitBlock KHONG can NodeView rieng (render qua schema thuan, xem
// post-extensions.ts) vi khong co dieu khien tuong tac nao - gio can 1 lop
// NodeViewWrapper "group relative" de neo nut menu, NGOAI RA giu NGUYEN
// className "split-block" tren NodeViewContent (khop dung CSS da viet san
// trong POST_PROSE_CLASS/docs-prose.ts, khong doi gi ve layout/style).
export function SplitBlockView({ node, editor, getPos }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper className="group">
      {editor.isEditable && (
        <div contentEditable={false} className="mb-1.5 flex justify-end">
          <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
        </div>
      )}
      <NodeViewContent className="split-block" />
    </NodeViewWrapper>
  );
}
