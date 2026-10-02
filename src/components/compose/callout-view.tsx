"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { Info, TriangleAlert, OctagonAlert, Lightbulb } from "lucide-react";
import { BlockActionsMenu } from "./BlockActionsMenu";
import type { CalloutVariant } from "./post-extensions";

// Icon THEO DUNG variant - cung bo icon da dung lam nguon COPY path data cho
// CALLOUT_ICONS (post-extensions.ts, dung cho HTML tinh/markdown xuat ra) -
// o day dung THANG component React, khong can tu ve SVG tay.
const VARIANT_ICON: Record<CalloutVariant, typeof Info> = {
  info: Info,
  warn: TriangleAlert,
  danger: OctagonAlert,
  success: Lightbulb,
};

// Callout - "hộp lưu ý" kieu Notion/GitBook (Warning/Danger/Good tips/Lưu ý).
// [2026-10-02] Nhan header TRUOC DAY fix cung theo variant (CALLOUT_LABELS),
// KHONG sua duoc - yeu cau nguoi dung: "Dạng này tôi muốn không fix cứng chữ
// Danger mà có thể edit chữ đấy. Bổ sung luôn emoji '⚠' mặc định trước nó".
// Gio la 1 o nhap that (input, contentEditable=false boc ngoai giong
// AccordionView) - gia tri KHOI TAO co san "⚠️ Tên chủ đề" (xem CALLOUT_LABELS),
// nguoi dung sua/xoa tu do sau do.
export function CalloutView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const variant: CalloutVariant = (node.attrs.variant as CalloutVariant) in VARIANT_ICON ? (node.attrs.variant as CalloutVariant) : "info";
  const label = (node.attrs.label as string) ?? "";
  const Icon = VARIANT_ICON[variant];

  return (
    <NodeViewWrapper data-callout="" data-variant={variant} className="group relative">
      <div className="callout-header" contentEditable={false}>
        <Icon size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
        {canEdit ? (
          <input
            value={label}
            onChange={(e) => updateAttributes({ label: e.target.value })}
            placeholder="Nhãn chủ đề..."
            className="min-w-0 flex-1 border-none bg-transparent p-0 font-semibold text-current outline-none placeholder:text-current/50"
          />
        ) : (
          <span>{label}</span>
        )}
        {canEdit && <BlockActionsMenu editor={editor} getPos={getPos} node={node} className="ml-auto" />}
      </div>
      <NodeViewContent className="callout-body" />
    </NodeViewWrapper>
  );
}
