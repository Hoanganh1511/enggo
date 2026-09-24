"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";
import type { SlashCommandItem } from "./slash-command-items";

export type SlashCommandMenuHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

// Dropdown hien khi go "/" (xem slash-command-extension.tsx) - dieu huong
// bang ArrowUp/ArrowDown/Enter qua `onKeyDown` (goi tu ben ngoai boi
// Suggestion's `render().onKeyDown`, KHONG phai addEventListener rieng - vi
// luc nay ban than input van la contentEditable cua editor, khong phai 1
// <input> that trong menu nay de tu nhan phim). useImperativeHandle deps
// PHAI liet ke DAY DU state/props dang dung ben trong `onKeyDown` (khac vi
// du mac dinh chi [] hay thay trong tai lieu) - neu khong, ham duoc "chup
// lai" (closure) tai handle luc DUNG DAU se giu MAI gia tri selectedIndex/
// items/command CU, khong bao gio thay du component re-render binh thuong.
export const SlashCommandMenu = forwardRef<
  SlashCommandMenuHandle,
  { items: SlashCommandItem[]; command: (item: SlashCommandItem) => void }
>(function SlashCommandMenu({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: ({ event }) => {
        if (items.length === 0) return false;
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }),
    [items, selectedIndex, command],
  );

  if (items.length === 0) {
    return (
      <div className="w-72 rounded-lg border border-border bg-surface p-3 text-[13px] text-ink-faint shadow-dropdown">
        Không tìm thấy lệnh phù hợp.
      </div>
    );
  }

  return (
    <div className="scrollbar-none max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-dropdown">
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          // onMouseDown + preventDefault (khong phai onClick don thuan) - giu
          // nguyen selection/focus cua editor TRUOC khi click kip chay (cung
          // ly do da fix o SelectionColorMenu.tsx: click vao 1 phan tu NGOAI
          // contentEditable binh thuong lam blur editor TRUOC, co the lam
          // sai lech `range` (vi tri "/query") ma item.run() can toi).
          onMouseDown={(e) => {
            e.preventDefault();
            command(item);
          }}
          onMouseEnter={() => setSelectedIndex(i)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left",
            i === selectedIndex && "bg-hover-bg",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-ink-muted">
            <item.Icon size={15} strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">{item.label}</span>
            <span className="block truncate text-[11.5px] text-ink-faint">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});
