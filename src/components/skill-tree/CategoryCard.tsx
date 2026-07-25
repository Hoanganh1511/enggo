import { X } from "lucide-react";
import {
  estimateCategoryStatus,
  getStatusStyle,
} from "@/lib/skill-tree/status-style";

type CategoryCardProps = {
  name: string;
  icon?: string | null;
  skillCount: number;
  avgMasteryPercent: number;
  isPreviewMode: boolean;
  onDelete: () => void;
};

const CategoryCard = ({
  name,
  skillCount,
  avgMasteryPercent,
  isPreviewMode,
  onDelete,
}: CategoryCardProps) => {
  const status = estimateCategoryStatus(avgMasteryPercent);
  const style = getStatusStyle(status);

  return (
    <div
      className={`group relative w-56 shrink-0 rounded-xl border p-3 ${style.borderClass}`}
      style={{
        background:
          "linear-gradient(160deg, rgba(15,23,42,0.9), rgba(10,15,28,0.95))",
      }}
    >
      {!isPreviewMode && (
        <button
          type="button"
          title="Xoá category"
          onClick={onDelete}
          className="absolute top-2 right-2 cursor-pointer text-ink-faint opacity-0 transition-opacity duration-150 ease-out hover:text-red-500 group-hover:opacity-100"
        >
          <X size={13} strokeWidth={1.75} />
        </button>
      )}
      {/* Mau chu hardcode nhu SkillCard.tsx, khong dung text-ink: --ink la
          CSS variable mau toi (light mode), gan nhu vo hinh tren nen kinh
          toi cua card nay khi trinh duyet/OS o che do sang. */}
      <p
        className="truncate pr-4 text-sm font-semibold"
        style={{ color: "#e2e8f0" }}
      >
        {name}
      </p>
      <p
        className={`mt-0.5 text-[10px] font-semibold tracking-wide uppercase ${style.textClass}`}
      >
        {status === "need-review" ? "Needs review" : status}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-ink-faint">{skillCount} skills</span>
        <span className={`text-sm font-bold tabular-nums ${style.textClass}`}>
          {avgMasteryPercent}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full ${style.barClass}`}
          style={{ width: `${avgMasteryPercent}%` }}
        />
      </div>
    </div>
  );
};

export default CategoryCard;
