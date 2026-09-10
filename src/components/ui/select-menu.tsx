"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "./popover";

// Select tu ve (khong dung <select> mac dinh cua trinh duyet) - droplist
// dung CHUNG token mau/animation voi moi dropdown khac trong app (xem
// popover.tsx, quy uoc trong CLAUDE.md). Dung cho EditProfileModal.tsx
// (Đại từ nhân xưng) - trigger khop dung style input chung (bg-input-bg/
// border-input-border), khong con la <select> nau/trang mac dinh cua he
// dieu hanh nhu truoc.
export function SelectMenu<T extends string>({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
}: {
  icon?: typeof ChevronDown;
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md border border-input-border bg-input-bg px-3 text-left text-sm transition-colors duration-150 ease-out focus:border-input-focus focus:ring-2 focus:ring-input-focus/15 focus:outline-none"
        >
          {Icon && <Icon size={15} strokeWidth={1.8} className="shrink-0 text-ink-faint" />}
          <span
            className={`min-w-0 flex-1 truncate ${selected ? "text-input-text" : "text-input-placeholder"}`}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`shrink-0 text-ink-faint transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        sideOffset={6}
        className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-surface shadow-dropdown"
      >
        <div className="max-h-64 overflow-y-auto p-1">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-hover-bg ${
                  active ? "font-semibold text-ink" : "text-ink-muted"
                }`}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                {active && <Check size={14} strokeWidth={2.2} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
