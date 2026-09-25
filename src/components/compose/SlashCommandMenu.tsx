"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SlashCommandItem } from "./slash-command-items";

export type SlashCommandMenuHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
  // Kich hoat hieu ung "biến mất" (exit animation) TRUOC khi bi go that khoi
  // DOM - xem comment o duoi ve ly do can 1 buoc rieng thay vi go luon.
  hide: () => void;
};

// [2026-09-25] Dropdown "/" (xem slash-command-extension.tsx) - yeu cau
// nguoi dung: "các options chọn được phải hiển thị dạng list trong popover"
// (dung y CHUAN popover cua toan app, xem CLAUDE.md muc "Dropdown / popover
// animation" + PopoverContent.tsx: AnimatePresence + motion.div initial
// opacity0/scale0.95/y-4 -> animate opacity1/scale1/y0, 0.15s easeOut).
// KHONG the dung THANG <PopoverRoot>/<PopoverContent> (Radix) - 2 he dinh vi
// khac nhau: PopoverContent bam theo 1 <PopoverTrigger> THAT trong cay Radix,
// con menu nay bam theo VI TRI CON TRO trong van ban (Suggestion's
// `props.mount()`, dung floating-ui rieng, khong co trigger element nao ca).
// Tai su dung DUNG BO GIA TRI animation (khong phai component) de giu dung
// cam giac dong bo voi moi popover khac trong app.
//
// Exit animation can 1 buoc RIENG (khac cac PopoverContent thuong, noi
// AnimatePresence tu lo het vi component luon o san trong cay React): o day
// ReactRenderer (slash-command-extension.tsx) se GO HAN component nay khoi
// DOM ngay khi Suggestion bao "onExit" - AnimatePresence khong kip choi hieu
// ung "bien mat" neu bi go dot ngot nhu vay. `hide()` (goi tu ben ngoai qua
// ref TRUOC khi thuc su unmount) chi DOI trang thai noi bo `visible=false` -
// AnimatePresence thay `false && ...` (phan tu bien mat khoi JSX) roi TU
// choi hieu ung exit, ben ngoai doi dung 150ms (transition duration) roi moi
// goi `component.destroy()` that.
export const SlashCommandMenu = forwardRef<
  SlashCommandMenuHandle,
  { items: SlashCommandItem[]; command: (item: SlashCommandItem) => void }
>(function SlashCommandMenu({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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
      hide: () => setVisible(false),
    }),
    [items, selectedIndex, command],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="z-50"
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {items.length === 0 ? (
            <div className="w-72 rounded-lg border border-border bg-surface p-3 text-[13px] text-ink-faint shadow-dropdown">
              Không tìm thấy lệnh phù hợp.
            </div>
          ) : (
            <div className="scrollbar-none max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-dropdown">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  // onMouseDown + preventDefault (khong phai onClick don
                  // thuan) - giu nguyen selection/focus cua editor TRUOC khi
                  // click kip chay (cung ly do da fix o SelectionColorMenu.tsx:
                  // click vao 1 phan tu NGOAI contentEditable binh thuong lam
                  // blur editor TRUOC, co the lam sai lech `range` (vi tri
                  // "/query") ma item.run() can toi).
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
