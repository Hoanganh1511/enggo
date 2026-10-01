"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePickerModal } from "./ImagePickerModal";
import { BlockActionsMenu } from "./BlockActionsMenu";
import type { PromoCardAttrs, PromoCardStyle } from "./post-extensions";

const inputClass =
  "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

const STYLE_OPTIONS: { value: PromoCardStyle; label: string }[] = [
  { value: "bot", label: "Gợi ý hỏi bot" },
  { value: "feature", label: "Thẻ quảng bá" },
  { value: "deeper", label: "Thẻ CTA (không ảnh)" },
];

// PromoCard - GOP LAM 1 node ca 3 block "botHelp"/"featurePromo"/"deeperCourse"
// cu cua he thong Section chèn thêm (xem comment day du o dinh nghia node
// trong post-extensions.ts) - chi khac nhau qua attr `style` (mau nen/nut +
// co anh hay khong), cung 1 bo field eyebrow/title/description/nut.
export function PromoCardView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const [pickerOpen, setPickerOpen] = useState(false);
  const a = node.attrs as PromoCardAttrs;

  if (!canEdit) {
    return (
      <NodeViewWrapper className={cn("promo-card", `promo-card-${a.style}`)}>
        {a.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- URL tuy y admin nhap
          <img src={a.imageUrl} alt="" className="promo-card-image" />
        )}
        <div className="promo-card-body">
          {a.eyebrow && <span className="promo-card-eyebrow">{a.eyebrow}</span>}
          <p className="promo-card-title">{a.title}</p>
          {a.description && <p className="promo-card-desc">{a.description}</p>}
        </div>
        {a.buttonLabel && (
          <a href={a.buttonHref || undefined} className="promo-card-btn">
            {a.buttonLabel}
          </a>
        )}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-md bg-surface-muted p-0.5">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateAttributes({ style: opt.value })}
              className={cn(
                "cursor-pointer rounded px-2 py-1 text-[11.5px] font-medium transition-colors duration-150 ease-out",
                a.style === opt.value ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
      </div>
      <div className={cn("promo-card", `promo-card-${a.style}`)}>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          title="Chọn ảnh"
          className="promo-card-image promo-card-image-picker flex shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-surface-muted text-ink-faint hover:text-ink"
          style={a.imageUrl ? { backgroundImage: `url(${a.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!a.imageUrl && <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />}
        </button>
        <div className="promo-card-body">
          <input
            value={a.eyebrow}
            onChange={(e) => updateAttributes({ eyebrow: e.target.value })}
            placeholder="Eyebrow (không bắt buộc)"
            className={`${inputClass} promo-card-eyebrow`}
          />
          <input
            value={a.title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Tiêu đề *"
            className={`${inputClass} promo-card-title`}
          />
          <textarea
            value={a.description}
            onChange={(e) => updateAttributes({ description: e.target.value })}
            placeholder="Mô tả"
            rows={2}
            className={`${inputClass} promo-card-desc resize-y`}
          />
        </div>
        <div className="promo-card-btn-edit flex shrink-0 flex-col gap-1.5">
          <input
            value={a.buttonLabel}
            onChange={(e) => updateAttributes({ buttonLabel: e.target.value })}
            placeholder="Nhãn nút"
            className={`${inputClass} promo-card-btn text-center`}
          />
          <input
            value={a.buttonHref}
            onChange={(e) => updateAttributes({ buttonHref: e.target.value })}
            placeholder="URL nút"
            className={`${inputClass} text-[11.5px] text-ink-faint`}
          />
        </div>
      </div>
      <ImagePickerModal open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => updateAttributes({ imageUrl: url })} />
    </NodeViewWrapper>
  );
}
