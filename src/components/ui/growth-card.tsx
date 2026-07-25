"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  NotebookPen,
  Flame,
  Clock,
  Brain,
  Sparkles,
  ArrowRight,
  Info,
  MoreVertical,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Spinner from "./spinner";
import LearningStreak, { type LearningStreakData } from "./learning-streak";
import TechTag from "./tech-tag";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import type { NodeStatus } from "@/lib/career-tree/node-status";
import type { NodeRole } from "@/lib/career-tree/types";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_STYLE,
} from "@/lib/career-tree/difficulty";
import { getTechIcon } from "@/lib/career-tree/tech-icons";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import {
  getHealthInfo,
  getHealthScore,
  getMasteryPercent,
  getMotivationalMessage,
  getTrendDirection,
  getNextStepSuggestion,
  getInsightMessage,
} from "@/lib/career-tree/node-narrative";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import type { ApiNodeListItem, Difficulty } from "@/lib/api/types";

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
  // chuc cay (root/branch).
  role?: NodeRole;
  isCollapsed?: boolean;
  isToggling?: boolean;
  onToggleCollapse?: () => void;
  onClick?: () => void;
  // Cac field "co hon" - deu optional de khong pha vo cac noi dang dung
  // GrowthCard voi du lieu toi gian (demo page).
  category?: string | null;
  difficulty?: Difficulty | null;
  tags?: string[];
  isPinned?: boolean;
  onTogglePin?: () => void;
  childNodes?: ApiNodeListItem[]; // de tinh "Next step"
  openIssueCount?: number;
  cardCount?: number; // raw, khac voi done (da cap o MAX_EXPECTED_CARDS)
  onSelectNode?: (nodeId: string) => void; // dieu huong khi bam "Next step"
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

function StatCell({
  icon: Icon,
  value,
  label,
  accentClass = "text-icon-active",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  // Streak dung mau nong (cam) de "noi" hon cac metric con lai - cac metric
  // khac deu giu mau accent mac dinh, khong doi theo status.
  accentClass?: string;
}) {
  return (
    <div className="flex min-h-17 flex-col items-center justify-center gap-0.5 rounded-lg border border-border py-2 text-center">
      <Icon size={13} strokeWidth={1.75} className={accentClass} />
      <span className="py-1 text-[9px] leading-tight font-semibold tabular-nums text-ink">
        {value}
      </span>
      <span className="text-[8px] leading-tight text-ink-faint">{label}</span>
    </div>
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
  status,
  role,
  isCollapsed,
  isToggling,
  onToggleCollapse,
  onClick,
  category = null,
  difficulty = null,
  tags = [],
  isPinned = false,
  onTogglePin,
  childNodes = [],
  openIssueCount = 0,
  cardCount,
  onSelectNode,
}: GrowthCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const masteryPercent = getMasteryPercent(cardCount ?? done);
  const health = status ? getHealthInfo(status) : null;
  const healthScore = getHealthScore({
    last7: streak.last7,
    lastActivity,
    openIssueCount,
  });
  const trend = getTrendDirection(streak.last7);
  const nextStep = getNextStepSuggestion(childNodes);
  const insightMessage = getInsightMessage({
    masteryPercent,
    nextStep,
    openIssueCount,
  });
  const secondaryTechIcon = tags.length > 1 ? getTechIcon(tags[1]) : null;

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
      className="relative w-100 cursor-pointer rounded-xl border border-border bg-surface p-5 text-left shadow-sm transition-colors duration-150 ease-out hover:border-hover-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Header: avatar + danh tinh + trang thai suc khoe */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted">
            <Icon className="h-5 w-5 text-icon-active" />
          </span>
          {secondaryTechIcon && (
            <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-surface-muted">
              <svg
                viewBox="0 0 24 24"
                width={11}
                height={11}
                fill={secondaryTechIcon.color}
              >
                <path d={secondaryTechIcon.path} />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {category}
              {trend === "up" && <TrendingUp size={10} strokeWidth={2} />}
              {trend === "down" && <TrendingDown size={10} strokeWidth={2} />}
            </span>
          )}
          <p className=" truncate text-sm font-semibold text-ink">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {role && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ROLE_BADGE_STYLE[role]}`}
              >
                {ROLE_BADGE_LABEL[role]}
              </span>
            )}
            {difficulty && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${DIFFICULTY_STYLE[difficulty]}`}
              >
                {DIFFICULTY_LABEL[difficulty]}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {subtitle} · {branches} nhánh
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            {health && (
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${health.dotClass}`}
                />
                <span className={health.textClass}>{health.label}</span>
              </span>
            )}
            <DropdownMenuRoot open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="nodrag flex size-6 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
                >
                  <MoreVertical size={14} strokeWidth={1.75} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                open={menuOpen}
                align="end"
                className="z-50 w-40 rounded-md border border-border bg-surface p-1 shadow-dropdown"
              >
                <DropdownMenuItem
                  onSelect={() => onTogglePin?.()}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink outline-none transition-colors duration-150 ease-out data-highlighted:bg-hover-bg"
                >
                  {isPinned ? (
                    <BookmarkCheck size={14} strokeWidth={1.75} />
                  ) : (
                    <Bookmark size={14} strokeWidth={1.75} />
                  )}
                  {isPinned ? "Bỏ ghim" : "Ghim node"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          </div>
        </div>
      </div>

      {/* Mastery */}
      <div className="mt-3">
        <div
          className={`mb-2 text-base font-semibold tabular-nums ${health?.textClass ?? "text-ink"}`}
        >
          {healthScore}%
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            Mastery
            <Info
              size={11}
              strokeWidth={1.75}
              className="cursor-help text-ink-faint"
              onClick={(e) => e.stopPropagation()}
            />
          </span>
          <span className="text-xs font-semibold tabular-nums text-ink">
            {masteryPercent}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className={`h-full rounded-full ${health?.barClass ?? "bg-primary"}`}
            style={{ width: `${masteryPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {onToggleCollapse && branches > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="nodrag flex min-h-17 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-border py-2 text-center transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <span className="flex items-center gap-0.5 text-icon-active">
              {isCollapsed ? (
                <ChevronRight size={11} strokeWidth={1.75} />
              ) : (
                <ChevronDown size={11} strokeWidth={1.75} />
              )}
              <GitBranch size={13} strokeWidth={1.75} />
            </span>
            <span className="text-xs leading-tight font-semibold tabular-nums text-ink">
              {branches}
            </span>
            <span className="text-[10px] leading-tight text-ink-faint">
              Nhánh
            </span>
          </button>
        ) : (
          <StatCell icon={GitBranch} value={branches} label="Nhánh" />
        )}
        <StatCell
          icon={NotebookPen}
          value={cardCount ?? done}
          label="Ghi chú"
        />
        <StatCell
          icon={Flame}
          value={streak.current}
          label="Streak"
          accentClass="text-orange-500 dark:text-orange-400"
        />
        <StatCell
          icon={Clock}
          value={lastActivity ? formatRelativeTime(lastActivity) : "—"}
          label="Học gần nhất"
        />
      </div>

      {/* Tags + bookmark */}
      {tags.length > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <TechTag key={tag} name={tag} />
            ))}
            {tags.length > 4 && (
              <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-ink-muted">
                +{tags.length - 4}
              </span>
            )}
          </div>
          <button
            type="button"
            title={isPinned ? "Bỏ ghim" : "Ghim node"}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin?.();
            }}
            className="nodrag shrink-0 cursor-pointer rounded-md p-1 text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            {isPinned ? (
              <BookmarkCheck
                size={15}
                strokeWidth={1.75}
                className="text-primary"
              />
            ) : (
              <Bookmark size={15} strokeWidth={1.75} />
            )}
          </button>
        </div>
      )}

      {isToggling && (
        <span className="absolute top-full left-1/2 mt-2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface shadow-sm">
          <Spinner size={12} />
        </span>
      )}
    </div>
  );
};

export default GrowthCard;
