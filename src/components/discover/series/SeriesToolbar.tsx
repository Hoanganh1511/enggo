"use client";

import { useState } from "react";
import { ChevronDown, LayoutGrid, List } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SERIES_ACCENT } from "./series-style";

// UI SHELL CHUA GAN LOGIC THAT - dung tinh than series-mock.ts hien tai
// (comment dau file do: "dot nay chi dung UI de chot huong thiet ke truoc").
// SERIES/RECOMMENDED_SERIES van la mang tinh, CHUA co field "linh vuc" rieng
// de loc that - component nay chi doi active state local de dung vi tri/
// style theo thiet ke (pill danh muc thay dropdown, khop anh tham khao), se
// noi vao query/API that khi Series co backend that.
const CATEGORY_PILLS = [
  "Tất cả",
  "Lập trình",
  "AI & Data",
  "Thiết kế",
  "Marketing",
  "Kinh doanh",
  "Kỹ năng mềm",
];

const SORT_OPTIONS = [
  { key: "recommended", label: "Sắp xếp đề xuất" },
  { key: "newest", label: "Mới nhất" },
  { key: "popular", label: "Nổi bật nhất" },
  { key: "ending", label: "Sắp kết thúc" },
] as const;

export function SeriesToolbar() {
  const [category, setCategory] = useState(CATEGORY_PILLS[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] =
    useState<(typeof SORT_OPTIONS)[number]["key"]>("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="scrollbar-none flex flex-1 items-center gap-1.5 overflow-x-auto">
        {CATEGORY_PILLS.map((label) => {
          const active = label === category;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setCategory(label)}
              className={cn(
                "flex h-8 shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition-colors duration-150 ease-out",
                active
                  ? "border-transparent text-white"
                  : "border-border text-ink-muted hover:bg-hover-bg hover:text-ink",
              )}
              style={active ? { background: SERIES_ACCENT } : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PopoverRoot open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out",
                sortOpen ? "bg-hover-bg text-ink" : "hover:bg-hover-bg hover:text-ink",
              )}
            >
              {SORT_OPTIONS.find((o) => o.key === sort)?.label}
              <ChevronDown size={13} strokeWidth={2} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            open={sortOpen}
            align="end"
            className="z-50 w-48 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
          >
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSort(key);
                  setSortOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out hover:bg-hover-bg",
                  key === sort ? "font-medium text-ink" : "text-ink-muted",
                )}
              >
                {label}
              </button>
            ))}
          </PopoverContent>
        </PopoverRoot>

        <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Xem dạng lưới"
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-sm transition-colors duration-150 ease-out",
              view === "grid"
                ? "bg-hover-bg text-ink"
                : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted",
            )}
          >
            <LayoutGrid size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="Xem dạng danh sách"
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-sm transition-colors duration-150 ease-out",
              view === "list"
                ? "bg-hover-bg text-ink"
                : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted",
            )}
          >
            <List size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
