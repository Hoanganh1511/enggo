"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { BookOpen, X } from "lucide-react";
import { RepeaterField } from "@/components/series/RepeaterField";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { normalizePrereqItem, type PrereqItem } from "./post-extensions";

const inputClass =
  "min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

function newPrereqItem(): PrereqItem {
  return { id: Math.random().toString(36).slice(2), term: "", definition: "" };
}

// PrereqBlock - "cần biết trước khi đọc tiếp" (xem comment day du o dinh
// nghia node trong post-extensions.ts). Thiet ke minimalism: 1 nhan nho o
// dau (icon sach + nhan tuy chinh) + danh sach thuat ngu, moi dong CHI 1 cham
// tron nho + thuat ngu in dam + dinh nghia mo nhat NGAY DUOI - khong khung
// vien rieng cho tung dong, khong mau sac ruom ra, chi dua vao khoang trong/
// ty le chu de tao phan cap ro rang.
export function PrereqBlockView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const title = (node.attrs.title as string) || "";
  const items = ((node.attrs.items ?? []) as Partial<PrereqItem>[]).map(normalizePrereqItem);

  if (!canEdit) {
    return (
      <NodeViewWrapper className="prereq-block">
        <div className="prereq-header">
          <BookOpen size={13} strokeWidth={2} className="prereq-header-icon" aria-hidden="true" />
          <span className="prereq-header-label">{title}</span>
        </div>
        <ul className="prereq-items">
          {items.map((item) => (
            <li key={item.id} className="prereq-item">
              <span className="prereq-item-dot" aria-hidden="true" />
              <span className="prereq-item-body">
                <span className="prereq-term">{item.term}</span>
                <span className="prereq-def">{item.definition}</span>
              </span>
            </li>
          ))}
        </ul>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4">
      <div className="mb-1.5 flex justify-end">
        <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
      </div>
      <div className="prereq-block">
        <div className="prereq-header">
          <BookOpen size={13} strokeWidth={2} className="prereq-header-icon shrink-0" aria-hidden="true" />
          <input
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Nhãn đầu khối (vd: Cần biết trước khi đọc tiếp)"
            className={`${inputClass} prereq-header-label w-full`}
          />
        </div>
        <div className="prereq-items">
          <RepeaterField
            items={items}
            onChange={(next) => updateAttributes({ items: next })}
            newItem={newPrereqItem}
            addLabel="Thêm khái niệm"
            renderRow={(item, update, remove) => (
              <div className="flex items-start gap-2">
                <span className="prereq-item-dot mt-2.5" aria-hidden="true" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <input
                    value={item.term}
                    onChange={(e) => update({ term: e.target.value })}
                    placeholder="Thuật ngữ *"
                    className={`${inputClass} prereq-term w-full`}
                  />
                  <textarea
                    value={item.definition}
                    onChange={(e) => update({ definition: e.target.value })}
                    placeholder="Định nghĩa ngắn gọn *"
                    rows={2}
                    className={`${inputClass} prereq-def w-full resize-y`}
                  />
                </div>
                <button
                  type="button"
                  onClick={remove}
                  aria-label="Xoá khái niệm"
                  className="mt-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
