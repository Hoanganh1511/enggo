"use client";

import { NotebookPen, Laptop, BookOpen, CircleHelp, GitBranch } from "lucide-react";
import SectionLabel from "./SectionLabel";
import LearningStreak, { type LearningStreakData } from "@/components/ui/learning-streak";

type StatsTabProps = {
  streak: LearningStreakData;
  lastActivity: string | null;
  done: number;
  total: number;
  cardCount: number;
  practiceCount: number;
  resourceCount: number;
  openIssueCount: number;
  branches: number;
};

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof NotebookPen;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-4 text-center">
      <Icon size={16} strokeWidth={1.75} className="text-icon-active" />
      <span className="text-xl font-semibold tabular-nums text-ink">{value}</span>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

const StatsTab = ({
  streak,
  lastActivity,
  done,
  total,
  cardCount,
  practiceCount,
  resourceCount,
  openIssueCount,
  branches,
}: StatsTabProps) => {
  const percent = total > 0 ? Math.min(100, (done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border p-4">
        <SectionLabel>Chuỗi học liên tục</SectionLabel>
        <div className="mt-3">
          <LearningStreak streak={streak} lastActivity={lastActivity} />
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <SectionLabel>Tiến độ hoàn thành</SectionLabel>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums text-ink">
            {done}/{total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={NotebookPen} value={cardCount} label="Tổng ghi chú" />
        <StatTile icon={Laptop} value={practiceCount} label="Buổi thực hành" />
        <StatTile icon={BookOpen} value={resourceCount} label="Tài liệu" />
        <StatTile icon={CircleHelp} value={openIssueCount} label="Vấn đề tồn đọng" />
        <StatTile icon={GitBranch} value={branches} label="Nhánh con" />
      </div>
    </div>
  );
};

export default StatsTab;
