"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUP_ICON_OPTIONS } from "./group-icons";

// Bang chon icon cho nhom kien thuc - danh sach curated tu lucide-react (xem
// group-icons.tsx), co o loc theo ten vi danh sach kha dai (~55 icon). Dung
// chung cho CreateGroupButton.tsx va EditGroupButton.tsx.
export function GroupIconPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = q
    ? GROUP_ICON_OPTIONS.filter((o) => o.name.toLowerCase().includes(q))
    : GROUP_ICON_OPTIONS;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2.5">
        <Search size={12} strokeWidth={1.9} className="text-ink-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm icon..."
          className="min-w-0 flex-1 bg-transparent text-[11px] text-ink outline-none placeholder:text-ink-faint"
        />
      </div>

      <div className="grid max-h-36 grid-cols-8 gap-1 overflow-y-auto rounded-md border border-border p-1.5">
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
                onClick={() => onChange(name)}
                title={name}
                className={cn(
                  "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out",
                  // Concept mau khu vuc Workspace la GRADIENT XANH DUONG co
                  // dinh (#20c5d8 -> #269ce9 -> #326eea, xem
                  // docs/workspace-style-guide.md muc 8), KHONG PHAI
                  // bg-community-accent (tim/violet - do la accent rieng cua
                  // tinh nang Community, khac feature).
                  active
                    ? "bg-gradient-to-r from-[#20c5d8] to-[#326eea] text-white"
                    : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                )}
              >
                <Icon size={15} strokeWidth={1.9} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
