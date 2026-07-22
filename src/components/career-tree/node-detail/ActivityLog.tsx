"use client";

import { useState } from "react";
import { Inbox, Laptop } from "lucide-react";
import SectionLabel from "./SectionLabel";
import Spinner from "@/components/ui/spinner";
import { formatDayLabel, formatTimeOnly } from "@/lib/career-tree/format-time";
import type { CardKind } from "@/lib/api/types";

export type Activity = {
  id: string;
  text: string;
  time: string;
  kind?: CardKind;
};

type ActivityLogProps = {
  activities: Activity[];
  isLoading?: boolean;
  onAddActivity: (text: string, kind: CardKind) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hideLabel?: boolean;
  // Khi co, an segmented control NOTE/PRACTICE va luon submit dung kind nay -
  // dung khi ActivityLog duoc nhung vao 1 tab da chuyen dung theo kind
  // (vd tab "Cong viec thuc hanh" chi hien PRACTICE).
  fixedKind?: CardKind;
};

type DayGroup = {
  label: string;
  items: Activity[];
};

function groupByDay(activities: Activity[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const activity of activities) {
    const label = formatDayLabel(activity.time);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(activity);
    } else {
      groups.push({ label, items: [activity] });
    }
  }
  return groups;
}

const ActivityLog = ({
  activities,
  isLoading,
  onAddActivity,
  hasMore,
  isLoadingMore,
  onLoadMore,
  hideLabel,
  fixedKind,
}: ActivityLogProps) => {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<CardKind>(fixedKind ?? "NOTE");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddActivity(trimmed, fixedKind ?? kind);
    setText("");
  };

  const sorted = [...activities].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  );
  const groups = groupByDay(sorted);

  return (
    <div>
      {!hideLabel && <SectionLabel>Nhật ký hoạt động</SectionLabel>}
      <div className={`flex items-center gap-2 ${hideLabel ? "" : "mt-2"}`}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Hôm nay học được gì?"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
        />
        {!fixedKind && (
          <div className="flex shrink-0 rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setKind("NOTE")}
              className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors duration-150 ease-out ${
                kind === "NOTE"
                  ? "bg-active-bg text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Ghi chú
            </button>
            <button
              type="button"
              onClick={() => setKind("PRACTICE")}
              className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors duration-150 ease-out ${
                kind === "PRACTICE"
                  ? "bg-active-bg text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Thực hành
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center gap-2 text-xs text-ink-muted">
          <Spinner size={18} />
          <span>Đang tải...</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center gap-2 text-center">
          <Inbox size={20} strokeWidth={1.75} className="text-ink-disabled" />
          <p className="text-xs text-ink-muted">Chưa có hoạt động nào.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-ink-muted">
                {group.label}
              </p>
              <ul className="mt-2 space-y-3">
                {group.items.map((activity, i) => (
                  <li key={activity.id} className="relative pl-4">
                    <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    {i < group.items.length - 1 && (
                      <span className="absolute left-[2.5px] top-3 h-full w-px bg-tree-line" />
                    )}
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-ink">{activity.text}</p>
                      {activity.kind === "PRACTICE" && (
                        <span className="flex shrink-0 items-center gap-1 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
                          <Laptop size={10} strokeWidth={2} />
                          Thực hành
                        </span>
                      )}
                    </div>
                    <p className="text-xs tabular-nums text-ink-faint">
                      {formatTimeOnly(activity.time)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="mt-2 w-full cursor-pointer rounded-lg py-2 text-center text-xs text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-wait"
            >
              {isLoadingMore ? "Đang tải..." : "Tải thêm"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
