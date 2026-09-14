"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionPickerItem } from "./post-extensions";

const MAX_ITEMS = 8;

// NodeView cua "TOC 4-box cau hoi" - CHI chay khi mount trong 1 Editor THAT
// (xem comment CuratedListView cung tinh than), KHONG anh huong ban render
// TINH (renderHTML cua QuestionPicker trong post-extensions.ts, dung
// <details> thuan). O day dung 1 state `openIndex` CUC BO (khong luu vao
// attrs) chi de xem truoc luc soan - luc doc THAT, hanh vi mo/dong do chinh
// nguoi doc bam <summary> quyet dinh qua CSS/HTML thuan, khong lien quan gi
// state nay.
export function QuestionPickerView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const items = (node.attrs.items ?? []) as QuestionPickerItem[];
  const canEdit = editor.isEditable;
  const [openIndex, setOpenIndex] = useState(0);

  function updateItem(index: number, patch: Partial<QuestionPickerItem>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateAttributes({ items: next });
  }

  function addItem() {
    if (items.length >= MAX_ITEMS) return;
    updateAttributes({
      items: [...items, { question: `Câu hỏi ${items.length + 1}`, description: "" }],
    });
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    updateAttributes({ items: items.filter((_, i) => i !== index) });
    if (openIndex === index) setOpenIndex(0);
  }

  return (
    <NodeViewWrapper contentEditable={false} className="my-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              key={i}
              className={cn(
                "group relative rounded-xl border border-border px-3.5",
                open && "bg-surface-muted",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="flex w-full cursor-pointer items-center gap-2.5 py-3 text-left select-none"
              >
                <span className="font-mono text-[12px] text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {canEdit ? (
                  <input
                    value={item.question}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateItem(i, { question: e.target.value })}
                    placeholder="Câu hỏi..."
                    className="min-w-0 flex-1 bg-transparent text-[14.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
                  />
                ) : (
                  <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-ink">
                    {item.question}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className={cn(
                    "shrink-0 text-ink-faint transition-transform duration-150",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open && (
                <div className="pb-3.5">
                  {canEdit ? (
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      placeholder="Mô tả ngắn khi mở câu hỏi này..."
                      rows={2}
                      className="w-full resize-y bg-transparent text-[13.5px] text-ink-muted outline-none placeholder:text-ink-faint"
                    />
                  ) : (
                    item.description && (
                      <p className="text-[13.5px] text-ink-muted">{item.description}</p>
                    )
                  )}
                </div>
              )}

              {canEdit && items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  aria-label="Bỏ câu hỏi"
                  className="absolute top-2 right-2 flex size-5 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                >
                  <X size={11} strokeWidth={2} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {canEdit && items.length < MAX_ITEMS && (
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
        >
          <Plus size={13} strokeWidth={2} />
          Thêm câu hỏi
        </button>
      )}
    </NodeViewWrapper>
  );
}
