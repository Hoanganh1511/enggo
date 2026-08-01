import { Users } from "lucide-react";

import type { CommunityGoal } from "@/content/series-mock";
import { ProgressBar } from "@/components/ui/progress-bar";

// Muc tieu cong dong KHAC series: khong co chu so huu, khong can xin/duyet -
// ai dong gop cung duoc tinh vao tien do chung. Vi chi co 1-2 muc nen de
// dang panel rong thay vi the hep nhu SeriesCard.
export function CommunityGoalCard({ goal }: { goal: CommunityGoal }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base leading-snug font-semibold text-ink">
          {goal.title}
        </h3>
        <p className="text-xs leading-relaxed text-ink-faint">
          {goal.description}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <ProgressBar percent={goal.progressPercent} className="h-2" />
        <div className="flex items-center justify-between text-[11px] text-ink-muted">
          <span className="font-medium text-ink">{goal.progressPercent}%</span>
          <span>Mục tiêu: {goal.goalLabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-muted">
        {goal.contributions.map((c) => (
          <span key={c.kind} className="inline-flex items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: c.accent }}
            />
            {c.label}
            <span className="font-medium text-ink">{c.count}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1 text-ink-faint">
          <Users size={11} strokeWidth={2} />
          {goal.contributorCount} người đóng góp
        </span>
      </div>
    </div>
  );
}
