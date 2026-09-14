"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SERIES_ICON_OPTIONS, SeriesIconGlyph } from "./series-icon-options";

// Nut chon icon (popover + luoi tim kiem) - thay the o nhap text ten icon tu
// do truoc day (yeu cau nguoi dung: "Phần icon cũng phải chọn", go sai chinh
// ta ten lucide se khong hien gi ca ma khong bao loi). Dung chung UI voi
// GroupIconPicker.tsx (workspaces) nhung danh sach rieng (series-icon-options.tsx).
export function SeriesIconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = q
    ? SERIES_ICON_OPTIONS.filter((o) => o.name.toLowerCase().includes(q))
    : SERIES_ICON_OPTIONS;

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-28 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-2 text-[12px] text-ink-muted hover:bg-hover-bg"
        >
          <SeriesIconGlyph name={value} size={15} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">{value || "Chọn icon"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        sideOffset={6}
        className="z-50 w-72 overflow-hidden rounded-md border border-border bg-surface p-2 shadow-dropdown"
      >
        <div className="mb-1.5 flex h-8 items-center gap-1.5 rounded-md border border-border bg-input-bg px-2.5">
          <Search size={12} strokeWidth={1.9} className="text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm icon..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        {/* max-h tang len (160px -> 256px) vi danh sach icon vua mo rong rat
            nhieu (yeu cau nguoi dung: "ít icon quá... thật nhiều vào") - van
            scroll duoc ben trong, chi cho xem duoc nhieu hang hon truoc khi
            phai cuon. */}
        <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="col-span-8 py-3 text-center text-[11px] text-ink-faint">
              Không tìm thấy icon.
            </p>
          ) : (
            filtered.map(({ name, icon: Icon }) => {
              const active = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out",
                    active
                      ? "bg-primary text-surface"
                      : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                  )}
                >
                  <Icon size={15} strokeWidth={1.9} />
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
