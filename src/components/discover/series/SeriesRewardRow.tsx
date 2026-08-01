import { Zap, Award } from "lucide-react";
import type { SeriesReward } from "@/content/series-mock";
import { cn } from "@/lib/utils";

// Dung chung giua SeriesCard (the o trang danh sach) va SeriesDetailContainer
// (hero) - 2 cho nen tach de khong chep lai markup phan thuong 2 lan.
export function SeriesRewardRow({
  reward,
  className,
}: {
  reward: SeriesReward;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        <Zap size={13} strokeWidth={2} className="shrink-0 text-warning" />
        <span className="font-medium text-ink">+{reward.xp} XP</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Award
          size={13}
          strokeWidth={2}
          className="shrink-0"
          style={{ color: reward.badgeAccent }}
        />
        <span className="truncate">{reward.badgeName}</span>
      </span>
    </div>
  );
}
