// [2026-10-15] EmptyState/ErrorState/LoginPrompt dung chung (spec muc 9
// "Components": EmptyState, LoadingState, ErrorState) - 1 noi, khong ve lai
// rieng tung trang.
import Link from "next/link";
import { AlertCircle, GraduationCap, Inbox } from "lucide-react";

export function ElLoginPrompt() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-14 text-center">
      <GraduationCap size={28} className="text-ink-faint" aria-hidden="true" />
      <p className="text-[14px] font-semibold text-ink">Đăng nhập để bắt đầu học</p>
      <p className="max-w-sm text-[12.5px] text-ink-muted">
        Tiến độ học tập, bài tập đã làm và sổ lỗi sai được lưu theo tài khoản của bạn.
      </p>
      <Link
        href="/login"
        className="mt-1 flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:opacity-90"
      >
        Đăng nhập
      </Link>
    </div>
  );
}

export function ElEmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <Inbox size={24} className="text-ink-faint" aria-hidden="true" />
      <p className="text-[13.5px] font-medium text-ink">{title}</p>
      {hint && <p className="max-w-sm text-[12px] text-ink-muted">{hint}</p>}
    </div>
  );
}

export function ElErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
      <AlertCircle size={22} className="text-danger" aria-hidden="true" />
      <p className="text-[13px] text-ink">{message}</p>
    </div>
  );
}

export function ElDemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-ink-muted uppercase">
      Demo content
    </span>
  );
}
