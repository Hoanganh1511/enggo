"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import SectionLabel from "./SectionLabel";
import Spinner from "@/components/ui/spinner";
import { formatDayLabel, formatTimeOnly } from "@/lib/career-tree/format-time";

export type Activity = {
  id: string;
  text: string;
  time: string;
};

type ActivityLogProps = {
  activities: Activity[];
  isLoading?: boolean;
  onAddActivity: (text: string) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hideLabel?: boolean;
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
}: ActivityLogProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddActivity(trimmed);
    setText("");
  };

  const sorted = [...activities].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  );
  const groups = groupByDay(sorted);

  return (
    <div>
      {!hideLabel && <SectionLabel>Nhật ký hoạt động</SectionLabel>}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Hôm nay học được gì?"
        className={`w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none ${hideLabel ? "" : "mt-2"}`}
      />

      {isLoading ? (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center gap-2 text-xs text-ink-muted">
          <Spinner size={18} />
          <span>Đang tải...</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center gap-2 text-center">
          <Inbox
            size={20}
            strokeWidth={1.75}
            className="text-ink-disabled"
          />
          <p className="text-xs text-ink-muted">
            Chưa có hoạt động nào.
          </p>
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
                    <p className="text-sm text-ink">
                      {activity.text}
                    </p>
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
