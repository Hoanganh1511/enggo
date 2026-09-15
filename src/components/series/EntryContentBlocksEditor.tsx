"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SelectMenu } from "@/components/ui/select-menu";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import type { EntryBlockButton, EntryBlockButtonStyle, EntryContentBlock } from "@/lib/api/content-series";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";

const BLOCK_TYPE_LABEL: Record<EntryContentBlock["type"], string> = {
  toc: "TOC dạng box (tự động theo H2)",
  install: "Box lệnh cài đặt",
  buttonGroup: "Nhóm nút",
  callout: "Vùng nhấn mạnh (full-width)",
};

const BUTTON_STYLE_OPTIONS: { value: EntryBlockButtonStyle; label: string }[] = [
  { value: "solid-yellow", label: "Nền vàng, chữ đen" },
  { value: "outline-black", label: "Viền đen, chữ đen" },
  { value: "ghost-gray", label: "Không viền, chữ xám" },
];

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function newBlock(type: EntryContentBlock["type"]): EntryContentBlock {
  switch (type) {
    case "toc":
      return { id: randomId(), type: "toc" };
    case "install":
      return { id: randomId(), type: "install", command: "", description: "", buttons: [] };
    case "buttonGroup":
      return { id: randomId(), type: "buttonGroup", buttons: [] };
    case "callout":
      return { id: randomId(), type: "callout", title: "" };
  }
}

function newButton(): EntryBlockButton {
  return { id: randomId(), label: "", url: "", style: "outline-black" };
}

// Editor cho danh sach "khoi noi dung" o dau 1 Entry - yeu cau nguoi dung
// (2026-09-15): "chia làm nửa trên... custom thêm đa dạng các element... Tôi
// có thể sắp xếp thứ tự hiển thị". Sap xep bang nut len/xuong (giong pattern
// `moveAction` trong SeriesCardConfigForm.tsx) THAY VI dnd-kit - danh sach o
// day thuong chi vai phan tu, khong dang keo them ca bo may DndContext cho
// 1 mang ngan. Xem SeriesEntryContentBlocks.tsx cho phan RENDER cong khai
// tuong ung.
export function EntryContentBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: EntryContentBlock[];
  onChange: (blocks: EntryContentBlock[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);

  function addBlock(type: EntryContentBlock["type"]) {
    onChange([...blocks, newBlock(type)]);
    setAddOpen(false);
  }

  function updateBlock(index: number, patch: Partial<EntryContentBlock>) {
    const next = [...blocks];
    next[index] = { ...next[index], ...patch } as EntryContentBlock;
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => (
        <div key={block.id} className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink">
              {BLOCK_TYPE_LABEL[block.type]}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                aria-label="Đưa lên"
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                aria-label="Đưa xuống"
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                aria-label="Xoá khối"
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {block.type === "toc" && (
            <p className="text-[12px] text-ink-faint">
              Tự quét các heading H2 trong nội dung, không cần cấu hình gì thêm.
            </p>
          )}

          {block.type === "install" && (
            <div className="flex flex-col gap-2">
              <input
                className={`${inputClass} font-mono`}
                placeholder="Command (vd: npx skills@latest add ...)"
                value={block.command}
                onChange={(e) => updateBlock(index, { command: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Mô tả sau lệnh (tuỳ chọn, vd: Then type /wizard...)"
                value={block.description ?? ""}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
              <ButtonListEditor
                buttons={block.buttons ?? []}
                onChange={(buttons) => updateBlock(index, { buttons })}
              />
            </div>
          )}

          {block.type === "buttonGroup" && (
            <ButtonListEditor
              buttons={block.buttons}
              onChange={(buttons) => updateBlock(index, { buttons })}
            />
          )}

          {block.type === "callout" && (
            <div className="flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="Eyebrow (tuỳ chọn, vd: AI Skills for Real Engineers)"
                value={block.eyebrow ?? ""}
                onChange={(e) => updateBlock(index, { eyebrow: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tiêu đề *"
                value={block.title}
                onChange={(e) => updateBlock(index, { title: e.target.value })}
              />
              <textarea
                className={`${inputClass} min-h-16 resize-y`}
                placeholder="Mô tả (tuỳ chọn)"
                value={block.description ?? ""}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}

      <PopoverRoot open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
          >
            <Plus size={14} /> Thêm khối
            <ChevronDown size={13} className={addOpen ? "rotate-180" : ""} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={addOpen}
          align="start"
          sideOffset={6}
          className="z-50 w-64 overflow-hidden rounded-md border border-border bg-surface shadow-dropdown"
        >
          <div className="p-1">
            {(Object.keys(BLOCK_TYPE_LABEL) as EntryContentBlock["type"][]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="flex w-full cursor-pointer items-center rounded-md px-2.5 py-2 text-left text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                {BLOCK_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
}

function ButtonListEditor({
  buttons,
  onChange,
}: {
  buttons: EntryBlockButton[];
  onChange: (buttons: EntryBlockButton[]) => void;
}) {
  return (
    <RepeaterField
      items={buttons}
      onChange={onChange}
      newItem={newButton}
      addLabel="Thêm nút"
      renderRow={(item, update, remove) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Label"
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="URL"
                value={item.url}
                onChange={(e) => update({ url: e.target.value })}
              />
            </div>
            <RemoveRowButton onClick={remove} />
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <SelectMenu
                value={item.style}
                onChange={(style) => update({ style })}
                options={BUTTON_STYLE_OPTIONS}
                placeholder="Kiểu nút"
              />
            </div>
            <label className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-muted">
              <input
                type="checkbox"
                checked={item.openInNewTab ?? false}
                onChange={(e) => update({ openInNewTab: e.target.checked })}
              />
              Mở tab mới
            </label>
          </div>
        </div>
      )}
    />
  );
}
