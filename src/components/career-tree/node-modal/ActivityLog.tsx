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

const ActivityLog = ({ activities, isLoading, onAddActivity }: ActivityLogProps) => {
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
      <SectionLabel>Nhật ký hoạt động</SectionLabel>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Hôm nay học được gì?"
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
      />

      {isLoading ? (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center gap-2 text-xs text-gray-900">
          <Spinner size={18} />
          <span>Đang tải...</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center gap-2 text-center">
          <Inbox size={20} strokeWidth={1.75} className="text-gray-300" />
          <p className="text-xs text-gray-900">Chưa có hoạt động nào.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-gray-500">{group.label}</p>
              <ul className="mt-2 space-y-3">
                {group.items.map((activity, i) => (
                  <li key={activity.id} className="relative pl-4">
                    <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-gray-900" />
                    {i < group.items.length - 1 && (
                      <span className="absolute left-[2.5px] top-3 h-full w-px bg-gray-200" />
                    )}
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs tabular-nums text-gray-400">
                      {formatTimeOnly(activity.time)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
