"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { GridCellHead } from "./GridCellHead";
import type { GridBadgeColor } from "./post-extensions";

// NodeView cua GridCell - noi GridCellHead (component THUAN, xem file do)
// voi editor that: doc gia tri tu node.attrs, ghi lai qua updateAttributes,
// tinh stepNumber tu VI TRI THAT cua chinh o nay trong Grid cha (khong luu
// san so thu tu vao attrs - luon "song" theo dung thu tu o hien co, giong
// tinh than TocBlock/insertToc() o cho khac trong file post-extensions.ts).
export function GridCellView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const pos = getPos();
  const stepNumber = pos === undefined ? 1 : editor.state.doc.resolve(pos).index() + 1;

  return (
    <NodeViewWrapper className="grid-cell">
      <GridCellHead
        color={(node.attrs.headColor as string | null) ?? null}
        badge={(node.attrs.badge as GridBadgeColor | null) ?? null}
        showStep={Boolean(node.attrs.showStep)}
        stepNumber={stepNumber}
        editable={canEdit}
        onColorChange={(headColor) => updateAttributes({ headColor })}
        onBadgeChange={(badge) => updateAttributes({ badge })}
        onShowStepChange={(showStep) => updateAttributes({ showStep })}
      />
      <NodeViewContent className="grid-cell-body" />
    </NodeViewWrapper>
  );
}
