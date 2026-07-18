"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, type LucideIcon } from "lucide-react";
import EditorPane from "./EditorPane";
import ActivityLog, { type Activity } from "./ActivityLog";
import AddChildBox from "./AddChildBox";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

type NodeDetailViewProps = {
  workspaceId: string;
  node: {
    id: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    branches: number;
    done: number;
    total: number;
    content: Record<string, unknown> | null;
    activities: Activity[];
    updatedAt: string;
    hasMoreActivities?: boolean;
    isLoadingMoreActivities?: boolean;
  };
  onContentChange: (json: Record<string, unknown>) => void;
  onAddChild: (name: string) => void;
  onDelete: () => void;
  onAddActivity: (text: string) => void;
  onLoadMoreActivities: () => void;
};

const NodeDetailView = ({
  workspaceId,
  node,
  onContentChange,
  onAddChild,
  onDelete,
  onAddActivity,
  onLoadMoreActivities,
}: NodeDetailViewProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const Icon = node.icon;

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="flex items-start justify-between gap-4  px-8 2xl:px-10  py-0 2xl:py-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* <Link
            href={`/w/${workspaceId}`}
            aria-label="Quay lại"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
          </Link>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
            <Icon
              size={18}
              strokeWidth={1.75}
              className="text-icon-active"
            />
          </span> */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-medium text-ink">
              {node.title}
            </h1>
            <p className="truncate text-xs tabular-nums text-ink-muted">
              {node.subtitle} · {node.branches} nhánh · {node.done}/{node.total}
            </p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_420px] gap-8 overflow-hidden p-8 2xl:p-10">
        <EditorPane content={node.content} onContentChange={onContentChange} />
        <div className="flex flex-col gap-6 overflow-y-auto border-l border-border pl-8">
          <div className="rounded-lg border border-border p-4">
            <ActivityLog
              activities={node.activities}
              onAddActivity={onAddActivity}
              hasMore={node.hasMoreActivities}
              isLoadingMore={node.isLoadingMoreActivities}
              onLoadMore={onLoadMoreActivities}
            />
          </div>
          <AddChildBox onAddChild={onAddChild} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-4">
        <p className="text-xs text-ink">
          Cập nhật lần cuối: {formatRelativeTime(node.updatedAt)}
        </p>
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-muted">
              Xóa node và {node.branches} nhánh con?
            </span>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-white transition-colors duration-150 ease-out hover:bg-red-700"
            >
              Xóa vĩnh viễn
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-disabled transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={13} strokeWidth={1.75} />
            Xóa node này
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeDetailView;
