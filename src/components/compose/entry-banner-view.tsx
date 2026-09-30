"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { BlockActionsMenu } from "./BlockActionsMenu";

const inputClass =
  "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

// EntryBanner - bang mau nhan manh full-width (thay the block "callout" cu
// cua he thong Section chèn thêm - xem comment dau file post-extensions.ts).
export function EntryBannerView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const eyebrow = (node.attrs.eyebrow as string) || "";
  const title = (node.attrs.title as string) || "";
  const description = (node.attrs.description as string) || "";

  if (!canEdit) {
    return (
      <NodeViewWrapper className="entry-banner">
        {eyebrow && <span className="entry-banner-eyebrow">{eyebrow}</span>}
        <p className="entry-banner-title">{title}</p>
        {description && <p className="entry-banner-desc">{description}</p>}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4">
      <div className="mb-1.5 flex justify-end">
        <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
      </div>
      <div className="entry-banner">
        <input
          value={eyebrow}
          onChange={(e) => updateAttributes({ eyebrow: e.target.value })}
          placeholder="Eyebrow (không bắt buộc)"
          className={`${inputClass} entry-banner-eyebrow`}
        />
        <input
          value={title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="Tiêu đề *"
          className={`${inputClass} entry-banner-title`}
        />
        <textarea
          value={description}
          onChange={(e) => updateAttributes({ description: e.target.value })}
          placeholder="Mô tả (không bắt buộc)"
          rows={2}
          className={`${inputClass} entry-banner-desc resize-y`}
        />
      </div>
    </NodeViewWrapper>
  );
}
