"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ImagePlus, X } from "lucide-react";
import { RepeaterField } from "@/components/series/RepeaterField";
import { ImagePickerModal } from "./ImagePickerModal";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { normalizeLessonListItem, type LessonListItem } from "./post-extensions";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

function newLessonItem(): LessonListItem {
  return { id: Math.random().toString(36).slice(2), imageUrl: "", title: "", description: "", href: "" };
}

// LessonListBlock - "danh sách bài học dạng thẻ" (thay the block "lessonList"
// cu cua he thong Section chèn thêm - xem comment dau file post-extensions.ts).
export function LessonListBlockView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const heading = (node.attrs.heading as string) || "";
  const items = ((node.attrs.items ?? []) as Partial<LessonListItem>[]).map(normalizeLessonListItem);
  const [pickerForIndex, setPickerForIndex] = useState<number | null>(null);

  if (!canEdit) {
    return (
      <NodeViewWrapper className="lesson-list-block">
        {heading && <p className="lesson-list-heading">{heading}</p>}
        <div className="lesson-list-items">
          {items.map((item, i) => (
            <a key={item.id} href={item.href || undefined} className="lesson-list-item">
              {/* eslint-disable-next-line @next/next/no-img-element -- URL tuy y admin nhap */}
              <img src={item.imageUrl} alt="" className="lesson-list-item-image" />
              <span className="lesson-list-item-body">
                <span className="lesson-list-item-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="lesson-list-item-title">{item.title}</span>
                {item.description && <span className="lesson-list-item-desc">{item.description}</span>}
              </span>
            </a>
          ))}
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4">
      <div className="mb-1.5 flex justify-end">
        <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
      </div>
      <div className="rounded-lg border border-border p-3">
        <input
          value={heading}
          onChange={(e) => updateAttributes({ heading: e.target.value })}
          placeholder="Tiêu đề chung (không bắt buộc, vd: 5 lessons, in order)"
          className="mb-2 w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[15px] font-bold outline-none placeholder:text-ink-faint hover:border-border focus:border-primary"
        />
        <RepeaterField
          items={items}
          onChange={(next) => updateAttributes({ items: next })}
          newItem={newLessonItem}
          addLabel="Thêm bài học"
          renderRow={(item, update, remove, index) => (
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => setPickerForIndex(index)}
                title="Chọn ảnh"
                className="flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-surface-muted text-ink-faint hover:text-ink"
                style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {!item.imageUrl && <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />}
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="Tiêu đề *" className={inputClass} />
                <input
                  value={item.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Mô tả (không bắt buộc)"
                  className={inputClass}
                />
                <input value={item.href} onChange={(e) => update({ href: e.target.value })} placeholder="URL *" className={inputClass} />
              </div>
              <button
                type="button"
                onClick={remove}
                aria-label="Xoá dòng"
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          )}
        />
      </div>
      <ImagePickerModal
        open={pickerForIndex !== null}
        onOpenChange={(open) => !open && setPickerForIndex(null)}
        onSelect={(url) => {
          if (pickerForIndex === null) return;
          updateAttributes({ items: items.map((it, i) => (i === pickerForIndex ? { ...it, imageUrl: url } : it)) });
          setPickerForIndex(null);
        }}
      />
    </NodeViewWrapper>
  );
}
