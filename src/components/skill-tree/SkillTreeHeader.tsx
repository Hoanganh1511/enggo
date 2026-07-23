import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ApiCategory, ApiNodeListItem } from "@/lib/api/types";
import { computeCategoryStats } from "@/lib/skill-tree/category-stats";
import { getStatusStyle } from "@/lib/skill-tree/status-style";
import CreateSkillModal from "./CreateSkillModal";

type SkillTreeHeaderProps = {
  workspaceId: string;
  category: ApiCategory;
  nodes: ApiNodeListItem[];
  rootNodeId: string | null;
  isPreviewMode: boolean;
};

// Header cua trang chi tiet 1 Knowledge Block - breadcrumb "Skill Tree /
// {ten block}" dan ve luoi tong quan, roi ten block lon + trang thai, roi
// dong phu "X skills · Y% mastered" (khop anh mau). "+ Skill" chuyen ve day
// (truoc o SkillTreeToolbar) vi anh mau dat no canh tieu de, khong con trong
// thanh cong cu duoi. Truoc day file nay la header rieng cua trang Skill Tree
// (workspace switcher + search) nhung da tat (comment) tu truoc - tai su
// dung dung vi tri nay cho vai tro moi thay vi de file chet.
const SkillTreeHeader = ({
  workspaceId,
  category,
  nodes,
  rootNodeId,
  isPreviewMode,
}: SkillTreeHeaderProps) => {
  const stats = computeCategoryStats(category, nodes);
  const style = getStatusStyle(stats.status);

  return (
    <div className="border-b border-border px-4 py-3">
      <Link
        href={`/skill-tree/${workspaceId}`}
        className="flex w-fit items-center gap-1 text-xs font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-ink"
      >
        <ChevronLeft size={13} strokeWidth={1.75} />
        Skill Tree
        <span>/</span>
        <span className="text-ink-muted">{category.name}</span>
      </Link>

      <div className="mt-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-ink">{category.name}</h1>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${style.badgeClass}`}
          >
            {stats.status === "need-review" ? "Needs review" : stats.status}
          </span>
        </div>
        {!isPreviewMode && (
          <CreateSkillModal
            workspaceId={workspaceId}
            rootNodeId={rootNodeId}
            categories={[category]}
          />
        )}
      </div>

      <p className="mt-0.5 text-sm text-ink-faint">
        {stats.skillCount} skills · {stats.avgMasteryPercent}% mastered
      </p>
    </div>
  );
};

export default SkillTreeHeader;
