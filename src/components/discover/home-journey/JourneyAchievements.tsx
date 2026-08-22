import { Flame, BookMarked, Library } from "lucide-react";
import type { ApiJourney } from "@/lib/api/types";

// Thay the khoi "Thanh tuu gan day" bia trong ban goc bang 3 so lieu THAT,
// tinh tu journey da fetch (khong goi API rieng) - chi hien badge nao > 0,
// an het khoi neu ca 3 deu 0 (user moi, chua co hoat dong gi).
export function JourneyAchievements({ journey }: { journey: ApiJourney }) {
  const maxStreak = journey.groups.reduce(
    (max, g) => Math.max(max, g.currentStreak),
    0,
  );
  const groupCount = journey.groups.length;

  const badges = [
    maxStreak > 0 && {
      icon: Flame,
      label: `Chuỗi ${maxStreak} ngày liên tiếp`,
    },
    journey.totalUnderstood > 0 && {
      icon: BookMarked,
      label: `Đã hiểu ${journey.totalUnderstood} mục kiến thức`,
    },
    groupCount > 0 && {
      icon: Library,
      label: `${groupCount} nhóm kiến thức đang theo đuổi`,
    },
  ].filter((b): b is { icon: typeof Flame; label: string } => Boolean(b));

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-muted"
        >
          <Icon size={14} strokeWidth={2} className="text-primary" />
          {label}
        </span>
      ))}
    </div>
  );
}
