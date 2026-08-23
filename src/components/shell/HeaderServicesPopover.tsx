"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { HOME_FEATURES } from "@/components/discover/home-features-data";
import { cn } from "@/lib/utils";

// Nut "Services" trong nav giua header - thay cho muc "Tin nhắn" cu (van con
// loi vao /messages that qua icon MessageCircle o cum ben phai header, xem
// TopHeaderBar.tsx, nen doi text muc nay khong mat chuc nang gi). Danh sach
// 6 dich vu lay CHUNG 1 nguon voi HomeFeatureGrid.tsx (home-features-data.ts)
// - moi item dan ve /home#home-feature-grid, noi 6 the do that su hien ra,
// khong bia route rieng khong ton tai cho tung dich vu.
export function HeaderServicesPopover() {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-ink transition-colors duration-150 ease-out",
            open ? "bg-primary-soft text-primary" : "hover:bg-hover-bg",
          )}
        >
          Services
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={cn(
              "shrink-0 transition-transform duration-150 ease-out",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        open={open}
        align="center"
        className="z-50 w-100 origin-top overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-dropdown"
      >
        <div className="flex flex-col gap-0.5">
          {HOME_FEATURES.map(
            ({ title, description, icon: Icon, iconColor, badge }) => (
              <Link
                key={title}
                href="/home#home-feature-grid"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-lg p-2.5 text-left transition-colors duration-150 ease-out hover:bg-primary-soft hover:from-violet-100 hover:to-pink-100"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-white shadow-md transition-colors duration-150 ease-out group-hover:border-transparent group-hover:bg-linear-to-r group-hover:from-violet-100 group-hover:to-pink-100">
                  <Icon size={17} className={iconColor} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 mb-1">
                    <span className="block text-sm font-semibold text-ink">
                      {title}
                    </span>
                    {badge && (
                      <span className="shrink-0 ml-1 rounded-md bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {description}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="mt-1 shrink-0 -translate-x-2.5 text-ink-faint opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Link>
            ),
          )}
        </div>

        <div className="my-2 h-px bg-border" />

        <Link
          href="/services"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3 rounded-lg bg-white p-2.5 text-left transition-colors duration-150 ease-out hover:bg-linear-to-r hover:from-violet-100 hover:to-pink-100"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-white shadow-md transition-colors duration-150 ease-out group-hover:border-transparent">
            <LayoutGrid size={17} className="text-ink" strokeWidth={2} />
          </span>
          <span className="flex flex-1 items-center">
            <span className="min-w-0 flex-1">
              <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                Xem tất cả dịch vụ
              </span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                Khám phá tất cả dịch vụ
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-ink-muted" />
          </span>
        </Link>
      </PopoverContent>
    </PopoverRoot>
  );
}
