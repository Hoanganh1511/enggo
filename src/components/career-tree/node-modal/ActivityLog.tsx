"use client";

import { useState } from "react";
import SectionLabel from "./SectionLabel";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

export type Activity = {
  id: string;
  text: string;
  time: string;
};

type ActivityLogProps = {
  activities: Activity[];
  onAddActivity: (text: string) => void;
};

const ActivityLog = ({ activities, onAddActivity }: ActivityLogProps) => {
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

  return (
    <div>
      <SectionLabel>Nhật ký hoạt động</SectionLabel>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Hôm nay học được gì?"
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />

      {sorted.length === 0 ? (
        <p className="mt-3 text-xs text-gray-400">Chưa có hoạt động nào.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {sorted.map((activity, i) => (
            <li key={activity.id} className="relative pl-4">
              <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-gray-900" />
              {i < sorted.length - 1 && (
                <span className="absolute left-[2.5px] top-3 h-full w-px bg-gray-200" />
              )}
              <p className="text-sm text-gray-900">{activity.text}</p>
              <p className="text-xs tabular-nums text-gray-400">
                {formatRelativeTime(activity.time)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;
