"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { SortKey } from "./toolbar-types";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "alphabet", label: "Alphabet" },
  { key: "mastery", label: "Mastery" },
  { key: "updated", label: "Cập nhật gần đây" },
  { key: "streak", label: "Streak" },
];

type SortMenuProps = {
  sortBy: SortKey | null;
  onChange: (key: SortKey | null) => void;
};

// "Custom Order" trong spec can keo-tha sap xep tay (Phase 3, chua lam) - hien
// disabled + badge thay vi an di, giu dung tinh than "hien nut, danh dau chua
// xong" ban da chon cho nhom AI.
const SortMenu = ({ sortBy, onChange }: SortMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
            sortBy
              ? "bg-primary/10 text-primary"
              : open
                ? "bg-hover-bg text-ink"
                : "text-ink-muted hover:bg-hover-bg hover:text-ink"
          }`}
        >
          <ArrowUpDown size={14} strokeWidth={1.75} />
          Sắp xếp
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        className="z-50 w-52 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
      >
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              onChange(sortBy === key ? null : key);
              setOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <span
              className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                sortBy === key ? "border-primary" : "border-border"
              }`}
            >
              {sortBy === key && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </span>
            {label}
          </button>
        ))}

        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          disabled
          title="Sắp ra mắt - cần kéo-thả sắp xếp tay"
          className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink-faint"
        >
          <span className="size-3.5 shrink-0 rounded-full border border-border" />
          <span className="flex-1">Custom Order</span>
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
            Sắp ra mắt
          </span>
        </button>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default SortMenu;
