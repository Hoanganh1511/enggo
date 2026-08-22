import { CheckCircle2, Flame, BookMarked, Library } from "lucide-react";
import type { ApiJourney } from "@/lib/api/types";

// Thay the khoi "Thanh tuu gan day" bia trong ban goc bang 3 so lieu THAT,
// tinh tu journey da fetch (khong goi API rieng) - chi hien badge nao > 0,
// an het khoi neu ca 3 deu 0 (user moi, chua co hoat dong gi). Style phong
// dung "railCard" cua ban mau (the bo tron, tung dong co dau tich xanh).
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
    <div
      className="max-w-md rounded-[13px] border p-4.5"
      style={{
        borderColor: "#ebe1d5",
        background: "#fffdf9",
        boxShadow: "0 5px 16px rgba(82,60,38,.04)",
      }}
    >
      <h3
        className="mb-1 text-[15px]"
        style={{ fontFamily: "Georgia, serif", color: "#2b2117" }}
      >
        🏆 Thành tựu gần đây
      </h3>
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center justify-between gap-3 py-2.5 text-[12px]"
          style={{ borderTop: "1px solid #f0e8de", color: "#4b4c46" }}
        >
          <span className="flex items-center gap-2">
            <Icon size={14} strokeWidth={2} style={{ color: "#d95b16" }} />
            {label}
          </span>
          <CheckCircle2 size={15} style={{ color: "#69a76f" }} />
        </div>
      ))}
    </div>
  );
}
