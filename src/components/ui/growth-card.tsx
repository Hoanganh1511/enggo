"use client";

import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  TriangleAlert,
} from "lucide-react";
import Spinner from "./spinner";
import LearningStreak, { type LearningStreakData } from "./learning-streak";
import type { NodeStatus } from "@/lib/career-tree/node-status";
import type { NodeRole } from "@/lib/career-tree/types";

type GrowthCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  branches: number;
  streak: LearningStreakData;
  lastActivity: string | null;
  done: number;
  total: number;
  status?: NodeStatus;
  // Quyet dinh badge "Chuyen muc"/"Chu de" duoi tieu de - giup phan biet
  // truc quan node co the click vao chi tiet (leaf/TOPIC) voi node chi to
  // chuc cay (root/branch), vi ca 2 gio deu la GrowthCard giong het nhau.
  role?: NodeRole;
  // true khi canvas dang zoom xa - an bot metadata phu, chi giu title/progress/status/streak.
  zoomedOut?: boolean;
  isCollapsed?: boolean;
  isToggling?: boolean;
  onToggleCollapse?: () => void;
  onClick?: () => void;
};

const ROLE_BADGE_LABEL: Record<NodeRole, string> = {
  root: "Lộ trình",
  branch: "Chuyên mục",
  leaf: "Chủ đề",
};

const ROLE_BADGE_STYLE: Record<NodeRole, string> = {
  root: "bg-surface-muted text-ink-muted",
  branch: "bg-surface-muted text-ink-muted",
  leaf: "bg-primary/15 text-primary",
};

function StatusDot({ status }: { status: NodeStatus }) {
  if (status === "need-review") {
    return (
      <TriangleAlert
        className="h-3 w-3 text-warning"
        strokeWidth={2}
        aria-label="Cần xem lại"
      />
    );
  }
  return (
    <span
      aria-label={status === "learning" ? "Đang học" : "Không hoạt động"}
      className={`block h-2 w-2 rounded-full ${
        status === "learning" ? "bg-primary" : "bg-ink-disabled"
      }`}
    />
  );
}

const GrowthCard = ({
  icon: Icon,
  title,
  subtitle,
  branches,
  streak,
  lastActivity,
  done,
  total,
  status,
  role,
  zoomedOut,
  isCollapsed,
  isToggling,
  onToggleCollapse,
  onClick,
}: GrowthCardProps) => {
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
      className="relative w-64 cursor-pointer rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-colors duration-150 ease-out hover:border-hover-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* {status && (
        <span className="absolute top-2 right-2">
          <StatusDot status={status} />
        </span>
      )} */}

      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
          <Icon className="h-4 w-4 text-icon-active" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          {role && (
            <span
              className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-opacity duration-300 ${ROLE_BADGE_STYLE[role]} ${
                zoomedOut ? "opacity-0" : "opacity-100"
              }`}
            >
              {ROLE_BADGE_LABEL[role]}
            </span>
          )}
          <p
            className={`truncate text-xs text-ink-muted transition-opacity duration-300 ${
              zoomedOut ? "opacity-0" : "opacity-100"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-ink-faint">
          {done}/{total}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span
          className={`transition-opacity duration-300 ${zoomedOut ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          {onToggleCollapse && branches > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="nodrag flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-xs text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
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
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <GitBranch className="h-3.5 w-3.5" />
              {branches} nhánh
            </span>
          )}
        </span>

        <LearningStreak streak={streak} lastActivity={lastActivity} />
      </div>

      {isToggling && (
        <span className="absolute top-full left-1/2 mt-2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface shadow-sm">
          <Spinner size={12} />
        </span>
      )}
    </div>
  );
};

export default GrowthCard;
