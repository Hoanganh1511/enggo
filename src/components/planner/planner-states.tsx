"use client";

// [2026-10-09] Trang thai RONG / DANG TAI / LOI - dung CHUNG (spec muc D).
// Truoc refactor: cho rong thi co 1 illustration, cho thi "..." , cho thi
// khong co gi ca; LOI thi KHONG CHO NAO hien - fetch that bai la danh sach
// im lang rong, khong phan biet duoc voi "that su khong co viec nao".

import { AlertCircle, CalendarPlus, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlannerEmptyState({
  title = "Chưa có việc nào",
  hint,
  action,
  className,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-8 text-center",
        className,
      )}
    >
      <CalendarPlus
        size={28}
        strokeWidth={1.5}
        className="text-[color:var(--planner-text-muted)] opacity-60"
        aria-hidden="true"
      />
      <p className="text-[13px] font-semibold text-[color:var(--planner-text-secondary)]">
        {title}
      </p>
      {hint && (
        <p className="max-w-[260px] text-[11.5px] leading-[1.5] text-[color:var(--planner-text-muted)]">
          {hint}
        </p>
      )}
      {action}
    </div>
  );
}

/** Khung xam nhip nhay - giu DUNG chieu cao noi dung that de khong giat layout. */
export function PlannerSkeletonRows({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-start gap-2 px-2 py-2">
          <span className="mt-0.5 size-4 shrink-0 animate-pulse rounded-full bg-[color:var(--planner-surface-soft)]" />
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span
              className="h-3 animate-pulse rounded-[4px] bg-[color:var(--planner-surface-soft)]"
              style={{ width: `${70 - i * 12}%` }}
            />
            <span className="h-2.5 w-[40%] animate-pulse rounded-[4px] bg-[color:var(--planner-surface-soft)]" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function PlannerErrorState({
  message = "Không tải được dữ liệu.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-8 text-center",
        className,
      )}
    >
      <AlertCircle
        size={26}
        strokeWidth={1.75}
        className="text-[color:var(--mset-danger)]"
        aria-hidden="true"
      />
      <p className="max-w-[280px] text-[12.5px] leading-[1.5] font-medium text-[color:var(--planner-text-secondary)]">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-0.5 inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-[color:var(--planner-border)] bg-[color:var(--planner-surface)] px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--planner-text-primary)] hover:bg-[color:var(--planner-surface-soft)]"
        >
          <RotateCw size={12} aria-hidden="true" />
          Thử lại
        </button>
      )}
    </div>
  );
}

/** Thong bao loi INLINE trong form (duoi 1 field hoac dau form). */
export function PlannerInlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-1 text-[11px] leading-[1.4] text-[color:var(--mset-danger)]",
        className,
      )}
    >
      <AlertCircle size={11} className="mt-[2px] shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
