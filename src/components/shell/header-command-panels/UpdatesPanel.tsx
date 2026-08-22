"use client";

import { Sparkles } from "lucide-react";
import MechanicalPanel from "./MechanicalPanel";
import { CHANGELOG } from "@/lib/changelog";
import { formatRelativeTime } from "@/lib/format-time";

// Danh sach cap nhat TINH (xem lib/changelog.ts) - khong co CMS/backend
// rieng, dev tu cap nhat mang nay moi khi ship tinh nang moi.
export function UpdatesPanel() {
  return (
    <MechanicalPanel title="Có gì mới">
      <div className="max-h-[420px] overflow-y-auto p-2">
        {CHANGELOG.map((entry) => (
          <div
            key={entry.id}
            className="flex gap-3 rounded-xl px-2.5 py-3 transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <span
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full"
              style={{ background: "var(--primary-soft)" }}
            >
              <Sparkles size={15} style={{ color: "var(--primary)" }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13.5px] font-semibold text-ink">
                  {entry.title}
                </p>
                <span className="shrink-0 text-[11px] text-ink-faint">
                  {formatRelativeTime(entry.date)}
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] leading-5 text-ink-muted">
                {entry.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </MechanicalPanel>
  );
}
