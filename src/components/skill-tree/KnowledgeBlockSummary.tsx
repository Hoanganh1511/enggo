import Link from "next/link";
import { ArrowUpRight, Folder } from "lucide-react";
import type { ApiCategory } from "@/lib/api/types";
import type { CategoryStats } from "@/lib/skill-tree/category-stats";
import { getStatusStyle, hexToRgba } from "@/lib/skill-tree/status-style";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

type KnowledgeBlockSummaryProps = {
  workspaceId: string;
  category: ApiCategory | null;
  stats: CategoryStats | null;
};

// Panel phai cua trang tong quan Knowledge Blocks - thay cho SkillDetailPanel
// (von chi hop ly khi da chon 1 skill, khong con y nghia o day vi trang nay
// khong hien skill truc tiep nua). Doi noi dung theo block dang HOVER (khong
// phai click - click luon dieu huong thang vao block theo spec).
const KnowledgeBlockSummary = ({
  workspaceId,
  category,
  stats,
}: KnowledgeBlockSummaryProps) => {
  if (!category || !stats) {
    return (
      <aside className="flex w-80 shrink-0 flex-col items-center justify-center gap-2 border-l border-border bg-surface p-4 text-center">
        <p className="text-sm text-ink-faint">
          Di chuột qua 1 Knowledge Block để xem tóm tắt.
        </p>
      </aside>
    );
  }

  const style = getStatusStyle(stats.status);

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-surface p-4">
      <div
        key={category.id}
        className="flex flex-col gap-4 animate-[skill-detail-fade-in_150ms_ease-out]"
      >
        <div className="flex items-center gap-2">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: hexToRgba(style.hex, 0.15), color: style.hex }}
          >
            <Folder size={16} strokeWidth={1.75} />
          </span>
          <p className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
            {category.name}
          </p>
        </div>

        <span
          className={`flex w-fit items-center gap-1 text-xs font-medium ${style.textClass}`}
        >
          <span className={`size-1.5 rounded-full ${style.dotClass}`} />
          {stats.status === "need-review" ? "Needs review" : stats.status}
        </span>

        {category.description ? (
          <p className="text-sm text-ink-muted">{category.description}</p>
        ) : (
          <p className="text-sm text-ink-faint italic">Chưa có mô tả.</p>
        )}

        <div>
          <div className="flex items-end justify-between">
            <span className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Mastery
            </span>
            <span
              className={`text-2xl font-bold tabular-nums ${style.textClass}`}
            >
              {stats.avgMasteryPercent}%
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full ${style.barClass}`}
              style={{ width: `${stats.avgMasteryPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-faint">Tổng skills</span>
            <span className="text-sm font-semibold text-ink">
              {stats.skillCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-faint">Cập nhật</span>
            <span className="text-sm font-semibold text-ink">
              {stats.lastActivity
                ? formatRelativeTime(stats.lastActivity)
                : "—"}
            </span>
          </div>
        </div>

        {stats.topLearnedNodes.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
              Học tốt nhất
            </p>
            <div className="flex flex-col gap-1">
              {stats.topLearnedNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-ink-muted">{node.title}</span>
                  <span className="shrink-0 font-medium text-ink">
                    {node.masteryPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.recentNodes.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
              Hoạt động gần đây
            </p>
            <div className="flex flex-col gap-1">
              {stats.recentNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-ink-muted">{node.title}</span>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {node.lastActivity && formatRelativeTime(node.lastActivity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/skill-tree/${workspaceId}/${category.id}`}
          className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          Enter Block
          <ArrowUpRight size={14} strokeWidth={1.75} />
        </Link>
      </div>
    </aside>
  );
};

export default KnowledgeBlockSummary;
