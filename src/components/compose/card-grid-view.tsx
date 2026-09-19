"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Plus, X } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  CARD_GRID_STATUS_COLORS,
  cardGridStatusColor,
  isValidCssColor,
  type CardGridItem,
  type CardGridStatus,
} from "./post-extensions";

const EMPTY_ITEM: CardGridItem = {
  icon: "★",
  iconBg: "#6366f1",
  title: "",
  status: "none",
  description: "",
  linkLabel: "",
  linkHref: "",
};

// Popover chon icon (van ban ngan, toi da ~2 ky tu - khong gioi han vao 1 bo
// icon Lucide co san, dung y "biến tấu theo nhiều mục đích" - nguoi dung co
// the go 1 ky tu/emoji bat ky) + mau nen, dung CHUNG 1 popover cho gon (2
// truong lien quan chat che, tach rieng 2 nut se rom).
function IconPicker({
  icon,
  iconBg,
  onChange,
}: {
  icon: string;
  iconBg: string;
  onChange: (patch: Partial<CardGridItem>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(iconBg);
  const [error, setError] = useState<string | null>(null);

  function commitColor(value: string) {
    const trimmed = value.trim();
    if (trimmed === "") return;
    if (isValidCssColor(trimmed)) {
      onChange({ iconBg: trimmed });
      setError(null);
    } else {
      setError("Không hợp lệ - dùng hex hoặc rgba(...)");
    }
  }

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setDraftColor(iconBg);
          setError(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Icon + màu nền"
          className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[22px] font-bold text-white"
          style={{ backgroundColor: iconBg || "#6366f1" }}
        >
          {icon || "★"}
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="start" sideOffset={6} className="z-50 w-56 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
        <label className="mb-1 block text-[11px] font-medium text-ink-faint">Icon (1-2 ký tự/emoji)</label>
        <input
          value={icon}
          maxLength={2}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder="★"
          className="mb-2 w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-center text-[14px] outline-none focus:border-primary"
        />
        <label className="mb-1 block text-[11px] font-medium text-ink-faint">Màu nền</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#([0-9a-f]{6})$/i.test(draftColor.trim()) ? draftColor.trim() : "#6366f1"}
            onChange={(e) => {
              setDraftColor(e.target.value);
              setError(null);
              onChange({ iconBg: e.target.value });
            }}
            className="size-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
          />
          <input
            value={draftColor}
            onChange={(e) => setDraftColor(e.target.value)}
            onBlur={(e) => commitColor(e.target.value)}
            placeholder="#RRGGBB hoặc rgba(...)"
            className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary"
          />
        </div>
        {error && <p className="mt-1.5 text-[11px] text-danger">{error}</p>}
      </PopoverContent>
    </PopoverRoot>
  );
}

function StatusPicker({
  status,
  onChange,
  open,
  onOpenChange,
}: {
  status: CardGridStatus;
  onChange: (status: CardGridStatus) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dotColor = cardGridStatusColor(status);
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Chấm trạng thái"
          className="flex size-3.5 shrink-0 cursor-pointer items-center justify-center self-start rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface"
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        >
          {!dotColor && <span className="size-full rounded-full border border-dashed border-ink-faint" />}
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="end" sideOffset={6} className="z-50 flex w-40 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
        {CARD_GRID_STATUS_COLORS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              onChange(s.id);
              onOpenChange(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted hover:bg-hover-bg hover:text-ink"
          >
            {s.value ? (
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: s.value }} />
            ) : (
              <span className="size-3 shrink-0 rounded-full border border-dashed border-ink-faint" />
            )}
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}

const inputClass =
  "min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

// NodeView cua CardGrid - yeu cau nguoi dung kem anh mau (7 card AWS
// service). La node ATOM (xem post-extensions.ts ve ly do chon huong nay
// thay vi content that) - NodeViewWrapper contentEditable=false TRON VEN
// (khac Grid/GridCell can NodeViewContent that de ProseMirror theo doi
// children thuc su - CardGrid khong co children nao ca, moi du lieu la
// attrs `items[]`).
export function CardGridView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const items = (node.attrs.items ?? []) as CardGridItem[];
  const canEdit = editor.isEditable;
  const [openPicker, setOpenPicker] = useState<number | null>(null);

  function updateItem(i: number, patch: Partial<CardGridItem>) {
    updateAttributes({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  }
  function addItem() {
    updateAttributes({ items: [...items, { ...EMPTY_ITEM }] });
  }
  function removeItem(i: number) {
    updateAttributes({ items: items.filter((_, idx) => idx !== i) });
  }

  if (!canEdit) {
    return (
      <NodeViewWrapper contentEditable={false} className="card-grid-view my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const dot = cardGridStatusColor(item.status);
          const Wrapper = item.linkHref ? "a" : "div";
          return (
            <Wrapper key={i} href={item.linkHref || undefined} className="card-grid-item">
              <div className="card-grid-item-top">
                <span className="card-grid-item-icon" style={{ backgroundColor: item.iconBg || "#6366f1" }}>
                  {item.icon}
                </span>
                <span className="card-grid-item-title">{item.title}</span>
                {dot && <span className="card-grid-item-dot" style={{ backgroundColor: dot }} />}
              </div>
              {item.description && <p className="card-grid-item-desc">{item.description}</p>}
              {item.linkLabel && <span className="card-grid-item-link">→ {item.linkLabel}</span>}
            </Wrapper>
          );
        })}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="card-grid-view my-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="group relative flex flex-col rounded-lg border border-border bg-surface p-4">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Xoá card này"
                className="absolute -top-2 -right-2 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
              >
                <X size={11} strokeWidth={2} />
              </button>
            )}
            {/* [2026-09-20] Icon to (size-13) + tieu de 17px/bold - khop dung
                cau truc anh mau nguoi dung gui (EC2/Lambda): "Cấu trúc thẻ
                trong grid đúng như này cho tôi" (xem CSS ban doc trong
                POST_PROSE_CLASS/docs-prose.ts, giao dien luc SOAN o day dong
                bo cung ty le de khong bi "giat hinh" giua luc soan va luc
                xuat ban). */}
            <div className="flex items-center gap-3">
              <IconPicker icon={item.icon} iconBg={item.iconBg} onChange={(patch) => updateItem(i, patch)} />
              <input
                value={item.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                placeholder="Tiêu đề"
                className={inputClass + " text-[17px] font-bold"}
              />
              <StatusPicker
                status={item.status}
                onChange={(status) => updateItem(i, { status })}
                open={openPicker === i}
                onOpenChange={(o) => setOpenPicker(o ? i : null)}
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(i, { description: e.target.value })}
              placeholder="Mô tả ngắn..."
              rows={2}
              className="mt-3.5 w-full resize-none rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13.5px] text-ink-muted outline-none placeholder:text-ink-faint hover:border-border focus:border-primary"
            />
            <div className="mt-3 flex items-center gap-1 text-[13.5px] font-semibold text-primary">
              <span className="shrink-0">→</span>
              <input
                value={item.linkLabel}
                onChange={(e) => updateItem(i, { linkLabel: e.target.value })}
                placeholder="Nhãn link (vd: 03.2 Compute)"
                className={inputClass + " text-primary"}
              />
            </div>
            <input
              value={item.linkHref}
              onChange={(e) => updateItem(i, { linkHref: e.target.value })}
              placeholder="URL đích (không bắt buộc)"
              className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[11.5px] text-ink-faint outline-none placeholder:text-ink-faint hover:border-border focus:border-primary"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex min-h-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-ink-faint hover:border-ink-faint hover:text-ink"
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </div>
    </NodeViewWrapper>
  );
}
