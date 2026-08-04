"use client";

import { useState } from "react";
import { ChevronDown, LayoutGrid, List } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// UI SHELL CHUA GAN LOGIC THAT - dung tinh than series-mock.ts hien tai
// (comment dau file do: "dot nay chi dung UI de chot huong thiet ke truoc").
// SERIES/RECOMMENDED_SERIES van la mang tinh, CHUA co field "linh vuc" rieng
// de loc that, va "Moi nhat/Noi bat/Sap ket thuc" chua sap xep lai gi ca -
// component nay chi doi active state local de dung vi tri/style theo thiet
// ke, se noi vao query/API that khi Series co backend that.
const FIELD_OPTIONS = [
  "Tất cả lĩnh vực",
  "Công nghệ & Kỹ thuật",
  "Thiết kế & Sáng tạo",
  "Marketing & Truyền thông",
  "Kinh doanh & Vận hành",
];

const SORT_TABS = [
  { key: "newest", label: "Mới nhất" },
  { key: "popular", label: "Nổi bật" },
  { key: "ending", label: "Sắp kết thúc" },
] as const;

export function SeriesToolbar() {
  const [fieldOpen, setFieldOpen] = useState(false);
  const [field, setField] = useState(FIELD_OPTIONS[0]);
  const [sortTab, setSortTab] =
    useState<(typeof SORT_TABS)[number]["key"]>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PopoverRoot open={fieldOpen} onOpenChange={setFieldOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-medium transition-colors duration-150 ease-out",
              fieldOpen
                ? "bg-hover-bg text-ink"
                : "text-ink-muted hover:bg-hover-bg hover:text-ink",
            )}
          >
            {field}
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={fieldOpen}
          align="start"
          className="z-50 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
        >
          {FIELD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setField(option);
                setFieldOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out hover:bg-hover-bg",
                option === field ? "font-medium text-ink" : "text-ink-muted",
              )}
            >
              {option}
            </button>
          ))}
        </PopoverContent>
      </PopoverRoot>

      <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5">
        {SORT_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSortTab(key)}
            className={cn(
              "h-7 cursor-pointer rounded-sm px-2.5 text-xs font-medium transition-colors duration-150 ease-out",
              sortTab === key
                ? "bg-primary text-white"
                : "text-ink-muted hover:bg-hover-bg hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5">
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
  );
}
