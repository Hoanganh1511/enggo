"use client";

// [2026-10-09] Panel CHI TIET 1 item - dung CHUNG cho moi noi mo chi tiet
// (bam the tren luoi tuan, bam hang trong panel ngay, bam o luoi thang).
//
// Truoc refactor: bam the tren luoi mo 1 popover tu ve, bam hang trong danh
// sach mo 1 khoi inline khac, va 2 cho hien KHONG CUNG tap thong tin (vd
// popover khong hien checklist, khoi inline khong hien link hop).

import { useState } from "react";
import { CalendarClock, Check, Loader2, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checklistProgress,
  isFinished,
  PLANNER_SCHEDULE_KIND_LABEL,
  PLANNER_TYPE_META,
  resolveCategoryColor,
  type CategoryColorOverrides,
  type PlannerItem,
} from "@/lib/planner/planner-domain";
import {
  CategoryBadge,
  ChecklistProgressBadge,
  PriorityMark,
  StatusBadge,
  TypeIcon,
} from "./planner-indicators";
import {
  LocationDisplay,
  MeetingLinkDisplay,
  ScheduleDisplay,
  formatDuration,
  type TimeFormat,
} from "./planner-datetime";
import { DeleteConfirmPopover } from "./macos-form-controls";
import { PlannerInlineError } from "./planner-states";
import { itemDurationMinutes } from "@/lib/planner/planner-domain";

export function PlannerItemDetail({
  item,
  overrides,
  timeFormat = "24H",
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleChecklistItem,
  className,
}: {
  item: PlannerItem;
  overrides?: CategoryColorOverrides;
  timeFormat?: TimeFormat;
  onEdit?: () => void;
  onDelete?: () => Promise<void> | void;
  onToggleComplete?: () => Promise<void> | void;
  onToggleChecklistItem?: (checklistItemId: string, done: boolean) => Promise<void> | void;
  className?: string;
}) {
  const color = resolveCategoryColor(item.category, overrides);
  const meta = PLANNER_TYPE_META[item.type];
  const progress = checklistProgress(item);
  const duration = itemDurationMinutes(item);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn?: () => Promise<void> | void) {
    if (!fn) return;
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thực hiện được. Thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {/* Dai mau category tren dau - nhan ra chu de ngay, cung ngon ngu voi
          thanh accent tren the. */}
      <span
        className="h-1 w-10 shrink-0 rounded-full"
        style={{ backgroundColor: color.main }}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <TypeIcon type={item.type} size={13} style={{ color: color.main }} />
          <span className="text-[11px] font-semibold tracking-[.02em] text-[color:var(--planner-text-muted)] uppercase">
            {meta.label}
          </span>
          <StatusBadge status={item.status} />
          <PriorityMark priority={item.priority} withLabel />
        </span>
        <h3
          className={cn(
            // break-words: tieu de dai KHONG tran ra khoi panel.
            "text-[15px] leading-[1.35] font-semibold break-words",
            isFinished(item)
              ? "text-[color:var(--planner-text-muted)] line-through"
              : "text-[color:var(--planner-text-primary)]",
          )}
        >
          {item.title}
        </h3>
      </div>

      {/* --- Thoi gian */}
      <div className="flex min-w-0 flex-col gap-1.5 rounded-[8px] bg-[color:var(--planner-surface-soft)] px-2.5 py-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <CalendarClock
            size={13}
            className="shrink-0 text-[color:var(--planner-text-muted)]"
            aria-hidden="true"
          />
          <ScheduleDisplay
            item={item}
            format={timeFormat}
            withDate
            withIcon={false}
            className="text-[12px] text-[color:var(--planner-text-primary)]"
          />
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-[18px] text-[10.5px] text-[color:var(--planner-text-muted)]">
          <span>{PLANNER_SCHEDULE_KIND_LABEL[item.scheduleKind]}</span>
          {duration !== null && <span>· {formatDuration(duration)}</span>}
        </span>
      </div>

      {/* --- Phan loai */}
      <CategoryBadge category={item.category} overrides={overrides} className="self-start" />

      {/* --- Dia diem / link */}
      {(item.location || item.meetingUrl) && (
        <div className="flex min-w-0 flex-col gap-1.5">
          {item.location && <LocationDisplay location={item.location} className="text-[12px]" />}
          {item.meetingUrl && (
            <MeetingLinkDisplay url={item.meetingUrl} interactive className="text-[12px]" />
          )}
        </div>
      )}

      {/* --- Mo ta */}
      {item.description && (
        <p className="text-[12.5px] leading-[1.6] whitespace-pre-wrap break-words text-[color:var(--planner-text-secondary)]">
          {item.description}
        </p>
      )}

      {/* --- Checklist (tich duoc ngay tai day, khong phai mo form sua) */}
      {progress && (
        <div className="flex min-w-0 flex-col gap-1.5">
          <ChecklistProgressBadge done={progress.done} total={progress.total} />
          <ul className="flex flex-col gap-1">
            {item.checklist.map((c) => (
              <li key={c.id} className="flex min-w-0 items-start gap-2">
                <input
                  type="checkbox"
                  checked={c.done}
                  disabled={busy || !onToggleChecklistItem}
                  onChange={(e) =>
                    void run(() => onToggleChecklistItem?.(c.id, e.target.checked))
                  }
                  className="mt-[3px] size-3.5 shrink-0 cursor-pointer accent-[color:var(--planner-primary)] disabled:cursor-default"
                  aria-label={c.title}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[12.5px] leading-[1.45] break-words",
                    c.done
                      ? "text-[color:var(--planner-text-muted)] line-through"
                      : "text-[color:var(--planner-text-primary)]",
                  )}
                >
                  {c.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <PlannerInlineError message={error} />}

      {/* --- Hanh dong */}
      <div className="flex items-center gap-2 border-t border-[color:var(--planner-border-soft)] pt-2.5">
        {/* EVENT khong "hoan thanh" duoc (meta.completable=false) - khong ve
            nut cho no thay vi ve roi bao loi khi bam. */}
        {meta.completable && onToggleComplete && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(onToggleComplete)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60",
              item.status === "COMPLETED"
                ? "border border-[color:var(--planner-border-soft)] bg-white text-[color:var(--planner-text-secondary)] hover:bg-[color:var(--planner-surface-soft)]"
                : "bg-[color:var(--mset-success)] text-white hover:brightness-95",
            )}
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            ) : item.status === "COMPLETED" ? (
              <RotateCcw size={12} aria-hidden="true" />
            ) : (
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            )}
            {item.status === "COMPLETED" ? "Bỏ hoàn thành" : "Hoàn thành"}
          </button>
        )}
        <span className="flex-1" />
        {onDelete && (
          <DeleteConfirmPopover
            label="Xoá"
            confirmText="Xoá việc này?"
            onConfirm={() => void run(onDelete)}
          />
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--planner-text-primary)] hover:bg-[color:var(--planner-surface-soft)]"
          >
            <Pencil size={12} aria-hidden="true" />
            Sửa
          </button>
        )}
      </div>
    </div>
  );
}
