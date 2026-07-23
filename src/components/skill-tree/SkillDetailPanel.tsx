import Link from "next/link";
import { ArrowUpRight, Target, Folder, FileText } from "lucide-react";
import type { ApiNodeListItem } from "@/lib/api/types";
import { resolveNodeRole, type NodeRole } from "@/lib/career-tree/types";
import { getNodeStatus } from "@/lib/career-tree/node-status";
import { getMasteryPercent } from "@/lib/career-tree/node-narrative";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_STYLE,
} from "@/lib/career-tree/difficulty";
import { getStatusStyle } from "@/lib/skill-tree/status-style";
import HexBadge from "./HexBadge";
import SkillIcon from "./SkillIcon";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

type SkillDetailPanelProps = {
  workspaceId: string;
  node: ApiNodeListItem | null;
};

const SkillDetailPanel = ({ workspaceId, node }: SkillDetailPanelProps) => {
  if (!node) {
    return (
      <aside className="flex w-80 shrink-0 flex-col items-center justify-center gap-2 border-l border-border bg-surface p-4 text-center">
        <p className="text-sm text-ink-faint">
          Chọn 1 node trên cây kỹ năng để xem chi tiết.
        </p>
      </aside>
    );
  }

  const masteryPercent = getMasteryPercent(node.cardCount);
  const status = getNodeStatus({
    streakCurrent: node.streak.current,
    openIssueCount: node.openIssueCount,
    masteryPercent,
    lastActivity: node.lastActivity,
  });
  const style = getStatusStyle(status);
  const Icon = ROLE_ICON[resolveNodeRole(node)];

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-surface p-4">
      {/* key={node.id} de React remount khoi nay moi lan doi node - retrigger
          animation fade-in, thay vi content nhay dot ngot. */}
      <div
        key={node.id}
        className="flex flex-col gap-4 animate-[skill-detail-fade-in_150ms_ease-out]"
      >
        <div className="flex items-center gap-2">
          <HexBadge size={36} status={status}>
            <SkillIcon title={node.title} fallback={Icon} size={16} />
          </HexBadge>
          <p className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
            {node.title}
          </p>
        </div>

        <div className="-mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`flex w-fit items-center gap-1 text-xs font-medium ${style.textClass}`}
          >
            <span className={`size-1.5 rounded-full ${style.dotClass}`} />
            {status}
          </span>
          {node.category && (
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {node.category}
            </span>
          )}
          {node.difficulty && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${DIFFICULTY_STYLE[node.difficulty]}`}
            >
              {DIFFICULTY_LABEL[node.difficulty]}
            </span>
          )}
        </div>

        {node.goal ? (
          <p className="text-sm text-ink-muted">{node.goal}</p>
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
              {masteryPercent}%
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full ${style.barClass}`}
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-faint">Ghi chú</span>
            <span className="text-sm font-semibold text-ink">
              {node.cardCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-faint">Streak</span>
            <span className="text-sm font-semibold text-ink">
              {node.streak.current} ngày
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-faint">Học gần nhất</span>
            <span className="text-sm font-semibold text-ink">
              {node.lastActivity ? formatRelativeTime(node.lastActivity) : "—"}
            </span>
          </div>
        </div>

        <Link
          href={`/w/${workspaceId}/nodes/${node.id}`}
          className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          Xem trang chi tiết đầy đủ
          <ArrowUpRight size={14} strokeWidth={1.75} />
        </Link>
      </div>
    </aside>
  );
};

export default SkillDetailPanel;
