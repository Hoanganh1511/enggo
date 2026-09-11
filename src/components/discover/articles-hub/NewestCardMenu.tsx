"use client";

import { useState } from "react";
import { Flag, Link2, MoreHorizontal } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Island nho DUY NHAT trong the NewestSection can tuong tac (mo popover) -
// tach rieng khoi card (Server Component) thay vi keo ca the thanh "use
// client". Cung khuon voi menu 3 cham cua PostCard.tsx (Copy link/Báo cáo,
// KHONG that su copy - PostCard.tsx cung vay, giu dung hanh vi de nhat quan
// UI, khong phai rieng file nay "gia").
export function NewestCardMenu() {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thêm tuỳ chọn"
          className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ease-out ${
            open ? "bg-hover-bg text-ink" : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted"
          }`}
        >
          <MoreHorizontal size={14} strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="end"
        className="z-50 w-40 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Link2 size={13} strokeWidth={1.75} />
          Copy link
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-red-500 transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Flag size={13} strokeWidth={1.75} />
          Báo cáo
        </button>
      </PopoverContent>
    </PopoverRoot>
  );
}
