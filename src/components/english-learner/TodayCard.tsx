import Link from "next/link";
import type { ApiEnglishToday } from "@/lib/api/english-learner";

const DAY_TYPE_LABEL: Record<ApiEnglishToday["dayType"], string> = {
  D1: "Kiến thức mới",
  D2: "Ôn lại & vận dụng",
};

export function TodayCard({ today }: { today: ApiEnglishToday }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="text-sm text-[var(--ink-muted)]">
        Unit {today.unit} · {DAY_TYPE_LABEL[today.dayType]}
      </div>

      {today.microSummary && (
        <p className="mt-2 text-sm text-[var(--ink)]">{today.microSummary}</p>
      )}

      <div className="mt-4 flex gap-6 text-sm">
        <div>
          <div className="text-xs text-[var(--ink-muted)]">Streak làm bài</div>
          <div className="text-lg font-semibold text-[var(--ink)]">
            {today.assessmentCurrentStreak} ngày
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--ink-muted)]">Streak kiến thức mới</div>
          <div className="text-lg font-semibold text-[var(--ink)]">
            {today.learningCurrentStreak} ngày
          </div>
        </div>
      </div>

      {today.alreadyCompletedFirstAttemptToday ? (
        <div className="mt-6">
          <p className="text-sm text-[var(--ink-muted)]">
            Bạn đã hoàn thành bài kiểm tra hôm nay. Có thể làm lại để luyện tập (không tính xác minh mới).
          </p>
          <Link
            href="/english-learner/session"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90"
          >
            Làm lại để luyện tập
          </Link>
        </div>
      ) : (
        <Link
          href="/english-learner/session"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90"
        >
          Bắt đầu bài kiểm tra hôm nay
        </Link>
      )}
    </div>
  );
}
