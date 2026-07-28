import { Flame, GemIcon, Sparkles } from "lucide-react";
import type { CareerSnapshot } from "@/content/user-profile";
import { hexToRgba } from "@/lib/skill-tree/status-style";

// Khoi "ho so nang luc" - phan RIENG cua career-tree, thu phan biet profile
// nay voi 1 trang mang xa hoi thong thuong. Co y KHONG ve bieu do: du lieu o
// day la vai con so roi rac + 1 ty le hoan thanh, dung dang stat tile/hero
// number la doc nhanh nhat.
//
// Quy uoc mau: moi con so/nhan deu mac token chu (text-ink/text-ink-muted),
// KHONG to theo mau accent - mau chi danh cho thanh meter cua "dang tap
// trung" (mau danh tinh cua Knowledge Block do, lay tu getBlockAccentColor).
function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface-muted p-3">
      <Icon size={15} strokeWidth={1.75} className="text-ink-faint" />
      <span className="text-lg font-bold text-ink tabular-nums">{value}</span>
      <span className="text-[11px] leading-tight text-ink-muted">{label}</span>
    </div>
  );
}

const ProfileCareerSnapshot = ({ career }: { career: CareerSnapshot }) => {
  const focus = career.currentFocus;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm font-bold text-ink">Hồ sơ năng lực</p>

      {/* Hero number - chi so tong quan, doc duoc trong 1 nhip */}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-ink tabular-nums">
          {career.careerScore}
        </span>
        <span className="text-sm text-ink-faint">/100</span>
        <span className="ml-auto rounded-md border border-active-border bg-active-bg px-2 py-0.5 text-xs font-semibold text-primary">
          {career.percentile}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatTile
          icon={Sparkles}
          value={String(career.skillsMastered)}
          label="Kỹ năng thành thạo"
        />
        <StatTile
          icon={GemIcon}
          value={String(career.totalBlocks)}
          label="Knowledge Block"
        />
        <StatTile
          icon={Flame}
          value={`${career.streakDays}`}
          label="Ngày liên tiếp"
        />
      </div>

      {focus && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-wide text-ink-faint uppercase">
              Đang tập trung
            </span>
            <span className="text-xs font-semibold text-ink tabular-nums">
              {focus.masteryPercent}%
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-medium text-ink">
            {focus.name}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${focus.masteryPercent}%`,
                background: `linear-gradient(90deg, ${hexToRgba(focus.accent, 0.55)}, ${focus.accent})`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCareerSnapshot;
