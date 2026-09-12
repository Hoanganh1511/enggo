"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { cn } from "@/lib/utils";
import type { ContentSeriesInstallTab } from "@/lib/api/content-series";

// Widget cai dat dang tab - dung CHUNG cho ca Overview lan cuoi 1 Entry (dac
// ta muc 2.1/2.2.9), chi khac DU LIEU truyen vao (Series.installTabs hoac
// Entry.installTabs neu co ghi de, xem trang [entrySlug]/page.tsx).
export function SeriesInstallWidget({ tabs }: { tabs: ContentSeriesInstallTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (tabs.length === 0) return null;
  const active = tabs[activeIndex];

  function handleCopy() {
    navigator.clipboard
      .writeText(active.command)
      .then(() => {
        setCopied(true);
        toast.success("Đã copy lệnh cài đặt");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.danger("Không copy được, thử lại sau."));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-0.5 border-b border-border bg-surface-muted p-1">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out",
                i === activeIndex ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 bg-[#0d1117] px-4 py-3">
        <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-pre text-[#e6edf3]">
          {active.command}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy lệnh"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#8b949e] transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      {(active.note || active.link) && (
        <div className="px-4 py-2.5 text-[13px] text-ink-faint">
          {active.note}
          {active.link && (
            <a href={active.link} target="_blank" rel="noreferrer" className="ml-1 text-primary hover:underline">
              Tìm hiểu thêm
            </a>
          )}
        </div>
      )}
    </div>
  );
}
