"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Plus, X } from "lucide-react";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { cn } from "@/lib/utils";
import type { StatsBarItem } from "./post-extensions";

// NodeView cua "StatsBar" (thanh thống kê ngang) - CHI phuc vu luc SOAN
// (giong tinh than FlowDiagramView/StatAccordionView: du lieu la snapshot
// attrs JSON, ban render TINH luc doc dung <div>/CSS thuan o post-extensions.ts).
// Editor hien THANG theo dung mau nen/vien toi co dinh (#141920/#2b333e) cua
// ban doc that (WYSIWYG) - khoi nay LUON toi mau du app dang o theme sang
// hay toi (xem comment trong post-extensions.ts). Moi o co 3 truong: gia tri
// (value), nhan (label), va mau rieng cho gia tri (color, chon qua
// <input type="color">) - yeu cau nguoi dung: "Các con số KHÔNG được
// hardcode", nen ca 3 deu la o nhap that, khong co gi co dinh ngoai 5 muc
// mac dinh luc chen moi (STATS_BAR_DEFAULT_ITEMS).
export function StatsBarView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const items = (node.attrs.items ?? []) as StatsBarItem[];
  const canEdit = editor.isEditable;

  function updateItem(index: number, patch: Partial<StatsBarItem>) {
    updateAttributes({ items: items.map((it, i) => (i === index ? { ...it, ...patch } : it)) });
  }
  function addItem() {
    updateAttributes({ items: [...items, { value: "", label: "", color: "#ffffff" }] });
  }
  function removeItem(index: number) {
    updateAttributes({ items: items.filter((_, i) => i !== index) });
  }

  return (
    <NodeViewWrapper contentEditable={false} className="stats-bar-view group my-4 flex w-full flex-col">
      {canEdit && (
        <div className="mb-1.5 flex w-full justify-end">
          <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
        </div>
      )}
      <div className="flex w-full flex-wrap border-y border-[#2b333e] bg-[#141920]">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "group/item relative flex min-w-[110px] flex-1 basis-[30%] flex-col px-5 py-5",
              i > 0 && "border-l border-[#2b333e]",
            )}
          >
            {canEdit && items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Bỏ ô này"
                className="absolute top-1.5 right-1.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#8b93a1] opacity-0 hover:bg-white/10 hover:text-white group-hover/item:opacity-100"
              >
                <X size={11} strokeWidth={2} />
              </button>
            )}
            {canEdit ? (
              <>
                <input
                  value={item.value}
                  onChange={(e) => updateItem(i, { value: e.target.value })}
                  placeholder="120"
                  style={{ color: item.color || "#ffffff" }}
                  className="w-full bg-transparent font-serif text-[26px] leading-none outline-none placeholder:text-white/25"
                />
                <input
                  value={item.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  placeholder="nhãn mô tả..."
                  className="mt-1.5 w-full bg-transparent font-sans text-[11.5px] text-[#8b93a1] outline-none placeholder:text-[#8b93a1]/50"
                />
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(item.color) ? item.color : "#ffffff"}
                  onChange={(e) => updateItem(i, { color: e.target.value })}
                  title="Màu con số"
                  className="mt-2 h-5 w-9 cursor-pointer rounded border border-[#2b333e] bg-transparent p-0"
                />
              </>
            ) : (
              <>
                <div className="font-serif text-[26px] leading-none" style={{ color: item.color || "#ffffff" }}>
                  {item.value}
                </div>
                <div className="mt-1.5 font-sans text-[11.5px] text-[#8b93a1]">{item.label}</div>
              </>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
        >
          <Plus size={13} strokeWidth={2} />
          Thêm ô thống kê
        </button>
      )}
    </NodeViewWrapper>
  );
}
