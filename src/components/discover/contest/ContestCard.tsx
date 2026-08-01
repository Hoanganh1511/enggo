import Link from "next/link";
import { Hash, Trophy, CalendarDays } from "lucide-react";

import type { Contest } from "@/lib/api/contests";
import { CONTEST_ACCENT } from "./contest-style";

function formatDeadline(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} tháng ${d.getMonth() + 1}`;
}

// The chu de/cuoc thi trong luoi 3 cot. Hashtag + vien deu dung CHUNG 1 mau
// (CONTEST_ACCENT) thay vi accent rieng tung contest. Badge goc phai phan
// biet CONTEST (co giai) va TOPIC (chu de viet thuong truc).
export function ContestCard({ contest }: { contest: Contest }) {
  const isContest = contest.kind === "CONTEST";

  return (
    <Link
      href={`/contest/${contest.slug}`}
      className="flex flex-col gap-3 rounded-lg border bg-surface p-4 transition-colors duration-150 ease-out hover:bg-hover-bg"
      style={{ borderColor: CONTEST_ACCENT }}
    >
      <div className="flex items-start justify-between gap-2">
        <Hash size={18} strokeWidth={2.25} style={{ color: CONTEST_ACCENT }} />
        <span
          className="shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: isContest ? CONTEST_ACCENT : "var(--ink-faint)" }}
        >
          {isContest ? "Cuộc thi" : "Chủ đề"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3
          className="text-base leading-snug font-bold"
          style={{ color: CONTEST_ACCENT }}
        >
          #{contest.hashtag}
        </h3>
        {contest.partnerName && (
          <p className="text-xs text-ink-muted italic">
            với {contest.partnerName}
          </p>
        )}
      </div>

      <p className="line-clamp-5 text-sm leading-relaxed text-ink-muted">
        {contest.description}
      </p>

      <div className="mt-auto flex flex-col gap-1.5 pt-1">
        {contest.prize && (
          <p className="flex items-start gap-1.5 text-xs text-ink-muted">
            <Trophy
              size={12}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-warning"
            />
            <span className="line-clamp-2">{contest.prize}</span>
          </p>
        )}
        {contest.deadline && (
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <CalendarDays size={12} strokeWidth={2} className="shrink-0" />
            Đến hết ngày {formatDeadline(contest.deadline)}
          </p>
        )}
        <p className="text-sm font-medium text-ink-faint">
          {contest.postCount.toLocaleString("vi-VN")} bài viết
        </p>
      </div>
    </Link>
  );
}
