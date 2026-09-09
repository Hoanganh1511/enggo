"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Tieu de + nut "?" giai thich muc dich tung trang trong /tracking - mo ta
// lay tu dung noi dung tai lieu Harvard nguoi dung gui (khong tu dien giai
// them), gan voi CHINH XAC module tuong ung. Dat o dau moi Shell.tsx.
export function TrackingPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <h1 className="font-content text-lg font-bold text-ink">{title}</h1>
      <PopoverRoot open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Giải thích: ${title}`}
            className="flex size-5 cursor-pointer items-center justify-center rounded-full text-ink-faint transition hover:bg-hover-bg hover:text-ink"
          >
            <HelpCircle size={15} strokeWidth={2} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={open}
          align="start"
          className="z-50 w-80 rounded-lg border border-border bg-surface p-3.5 shadow-dropdown"
        >
          <p className="font-content text-sm leading-6 text-ink-muted">{description}</p>
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
}
