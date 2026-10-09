"use client";

// [2026-10-09] Chi bao CATEGORY / STATUS / PRIORITY / TYPE - dung CHUNG o
// MOI noi (the tren luoi gio, hang danh sach, panel chi tiet, form, sidebar).
//
// Truoc refactor moi noi tu ve lai cham/badge/gach ngang theo kieu rieng, nen
// cung 1 trang thai trong ra khac nhau giua cac view. Gio 1 chi bao = 1
// component.
//
// NGUYEN TAC (design reference, "Keep category and status separate"):
//   - CATEGORY quyet dinh MAU THE (accent + nen nhat).
//   - STATUS la 1 lop RIENG: badge/cham/gach ngang - KHONG to lai ca the,
//     de category van doc duoc.
//   - PRIORITY doc lap voi ca hai.
// Va (spec muc D) moi trang thai phai hieu duoc KHONG CHI NHO MAU: status co
// icon + chu, priority co dau "!" + chu, nen nguoi mu mau / man hinh don sac
// van phan biet duoc.

import {
  AlertTriangle,
  Ban,
  Bell,
  CalendarDays,
  Check,
  CircleDashed,
  Clock,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLANNER_CATEGORY_META,
  PLANNER_PRIORITY_META,
  PLANNER_STATUS_META,
  PLANNER_TYPE_META,
  resolveCategoryColor,
  type CategoryColorOverrides,
  type PlannerCategory,
  type PlannerPriority,
  type PlannerStatus,
  type PlannerItemType,
} from "@/lib/planner/planner-domain";

// --- TYPE ------------------------------------------------------------------

export const PLANNER_TYPE_ICON: Record<PlannerItemType, LucideIcon> = {
  TASK: ListChecks,
  EVENT: CalendarDays,
  REMINDER: Bell,
};

export function TypeIcon({
  type,
  size = 13,
  className,
  style,
}: {
  type: PlannerItemType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = PLANNER_TYPE_ICON[type];
  return (
    <Icon
      size={size}
      className={className}
      style={style}
      aria-label={PLANNER_TYPE_META[type].label}
    />
  );
}

// --- CATEGORY --------------------------------------------------------------

export function CategoryDot({
  category,
  overrides,
  size = 8,
  muted,
  className,
}: {
  category: PlannerCategory;
  overrides?: CategoryColorOverrides;
  size?: number;
  /** Item da xong/huy - lam nhat di thay vi mau category day. */
  muted?: boolean;
  className?: string;
}) {
  const color = resolveCategoryColor(category, overrides);
  return (
    <span
      className={cn("shrink-0 rounded-full", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: muted ? "var(--planner-text-muted)" : color.main,
        opacity: muted ? 0.5 : 1,
      }}
      title={PLANNER_CATEGORY_META[category].label}
      aria-hidden="true"
    />
  );
}

/** Nhan category co chu - dung o panel chi tiet / form, KHONG dung tren the
 *  nho (the chi can mau nen + thanh accent la du nhan ra). */
export function CategoryBadge({
  category,
  overrides,
  className,
}: {
  category: PlannerCategory;
  overrides?: CategoryColorOverrides;
  className?: string;
}) {
  const color = resolveCategoryColor(category, overrides);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
      style={{
        backgroundColor: color.light,
        borderColor: color.border,
        color: "var(--planner-text-primary)",
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color.main }}
        aria-hidden="true"
      />
      {PLANNER_CATEGORY_META[category].label}
    </span>
  );
}

// --- STATUS ----------------------------------------------------------------

const STATUS_ICON: Record<PlannerStatus, LucideIcon> = {
  SCHEDULED: CalendarDays,
  IN_PROGRESS: Clock,
  COMPLETED: Check,
  NEEDS_ATTENTION: AlertTriangle,
  OVERDUE: AlertTriangle,
  CANCELLED: Ban,
};

/**
 * Badge trang thai. KHONG hien cho SCHEDULED o che do `onlyNotable` - trang
 * thai "da len lich" la MAC DINH, hien badge cho no chi lam nhieu the.
 */
export function StatusBadge({
  status,
  onlyNotable = false,
  compact = false,
  className,
}: {
  status: PlannerStatus;
  onlyNotable?: boolean;
  /** Chi icon, khong chu - cho the hep tren luoi gio. */
  compact?: boolean;
  className?: string;
}) {
  if (onlyNotable && status === "SCHEDULED") return null;
  const meta = PLANNER_STATUS_META[status];
  const Icon = STATUS_ICON[status];

  if (compact) {
    return (
      <span
        className={cn("inline-flex shrink-0 items-center", className)}
        style={{ color: meta.color }}
        title={meta.label}
      >
        <Icon size={11} strokeWidth={2.5} aria-label={meta.label} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[10.5px] font-semibold",
        className,
      )}
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in srgb, ${meta.color} 13%, transparent)`,
      }}
    >
      <Icon size={10} strokeWidth={2.75} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

// --- PRIORITY --------------------------------------------------------------

/**
 * Uu tien hien bang dau "!" (1-3 cai) + mau - KHONG chi dua vao mau, va cung
 * khong chiem cho nhu 1 badge co chu. NONE = khong ve gi.
 */
export function PriorityMark({
  priority,
  withLabel = false,
  className,
}: {
  priority: PlannerPriority;
  withLabel?: boolean;
  className?: string;
}) {
  if (priority === "NONE") return null;
  const meta = PLANNER_PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[11px] leading-none font-bold",
        className,
      )}
      style={{ color: meta.color }}
      title={`Ưu tiên: ${meta.label}`}
    >
      <span aria-hidden="true">{meta.mark}</span>
      {withLabel && <span className="font-medium">{meta.label}</span>}
      <span className="sr-only">Ưu tiên {meta.label}</span>
    </span>
  );
}

// --- CHECKLIST -------------------------------------------------------------

export function ChecklistProgressBadge({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const complete = total > 0 && done === total;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[10.5px] font-medium tabular-nums",
        complete
          ? "text-[color:var(--mset-success)]"
          : "text-[color:var(--planner-text-muted)]",
        className,
      )}
      title={`${done}/${total} việc con đã xong`}
    >
      {complete ? (
        <Check size={10} strokeWidth={3} aria-hidden="true" />
      ) : (
        <CircleDashed size={10} strokeWidth={2.5} aria-hidden="true" />
      )}
      {done}/{total}
    </span>
  );
}
