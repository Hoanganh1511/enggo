"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { X } from "lucide-react";
import { RepeaterField } from "@/components/series/RepeaterField";
import { SelectMenu } from "@/components/ui/select-menu";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { normalizeEntryButtonItem, type EntryBlockButtonItem } from "./post-extensions";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

const STYLE_OPTIONS: { value: EntryBlockButtonItem["style"]; label: string }[] = [
  { value: "solid", label: "Nền đen, chữ trắng" },
  { value: "outline", label: "Viền đen, chữ đen" },
  { value: "ghost", label: "Không viền, chữ xám" },
];

// EntryButtonGroup - "1 hàng nhiều nút bấm" (thay the block "buttonGroup" cu
// cua he thong Section chèn thêm - xem comment dau file post-extensions.ts).
export function EntryButtonGroupView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const buttons = ((node.attrs.buttons ?? []) as Partial<EntryBlockButtonItem>[]).map(normalizeEntryButtonItem);

  if (!canEdit) {
    return (
      <NodeViewWrapper className="entry-button-group">
        {buttons.map((b, i) => (
          <a key={i} href={b.href || undefined} className={`entry-btn entry-btn-${b.style}`}>
            {b.label}
          </a>
        ))}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4">
      <div className="mb-1.5 flex justify-end">
        <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
      </div>
      <div className="rounded-lg border border-border p-3">
        <RepeaterField
          items={buttons}
          onChange={(next) => updateAttributes({ buttons: next })}
          newItem={() => ({ label: "", href: "", style: "outline" }) as EntryBlockButtonItem}
          addLabel="Thêm nút"
          renderRow={(item, update, remove) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  value={item.label}
                  onChange={(e) => update({ label: e.target.value })}
                  placeholder="Nhãn nút"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={remove}
                  aria-label="Xoá nút"
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={item.href}
                  onChange={(e) => update({ href: e.target.value })}
                  placeholder="URL (vd: https://...)"
                  className={inputClass}
                />
                <div className="w-44 shrink-0">
                  <SelectMenu value={item.style} onChange={(style) => update({ style })} options={STYLE_OPTIONS} placeholder="Kiểu nút" />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </NodeViewWrapper>
  );
}
