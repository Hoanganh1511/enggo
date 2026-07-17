"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronRight, GitBranch } from "lucide-react";
import Spinner from "./spinner";

export type CardFrequency = "daily" | "weekly" | "monthly";

type GrowthCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  branches: number;
  frequency: CardFrequency;
  done: number;
  total: number;
  isCollapsed?: boolean;
  isToggling?: boolean;
  onToggleCollapse?: () => void;
  onClick?: () => void;
};

const FREQUENCY_LABEL: Record<CardFrequency, string> = {
  daily: "Hằng ngày",
  weekly: "Hằng tuần",
  monthly: "Thỉnh thoảng",
};

const FREQUENCY_LEVEL: Record<CardFrequency, 0 | 1 | 2> = {
  monthly: 0,
  weekly: 1,
  daily: 2,
};

function FrequencyBars({ level }: { level: 0 | 1 | 2 }) {
  const heights = ["h-1.5", "h-2.5", "h-3.5"];
  return (
    <span className="flex items-end gap-0.5">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${h} ${i <= level ? "bg-gray-900" : "bg-gray-200"}`}
        />
      ))}
    </span>
  );
}

const GrowthCard = ({
  icon: Icon,
  title,
  subtitle,
  branches,
  frequency,
  done,
  total,
  isCollapsed,
  isToggling,
  onToggleCollapse,
  onClick,
}: GrowthCardProps) => {
  const safeFrequency: CardFrequency = FREQUENCY_LABEL[frequency]
    ? frequency
    : "weekly";
  const percent = total > 0 ? Math.min(100, (done / total) * 100) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="relative w-64 cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-4 w-4 text-gray-900" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{title}</p>
          <p className="truncate text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-gray-400">
          {done}/{total}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        {onToggleCollapse && branches > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="nodrag flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            <GitBranch className="h-3.5 w-3.5" />
            {branches} nhánh
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <GitBranch className="h-3.5 w-3.5" />
            {branches} nhánh
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <FrequencyBars level={FREQUENCY_LEVEL[safeFrequency]} />
          {FREQUENCY_LABEL[safeFrequency]}
        </span>
      </div>

      {isToggling && (
        <span className="absolute top-full left-1/2 mt-2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <Spinner size={12} />
        </span>
      )}
    </div>
  );
};

export default GrowthCard;
