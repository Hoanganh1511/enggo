"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Folder,
  FileText,
  Target,
  ArrowUpRight,
  NotebookPen,
  GitBranch,
} from "lucide-react";
import AddChildBox from "./node-detail/AddChildBox";
import LearningStreak from "@/components/ui/learning-streak";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import type { ApiNodeListItem, NodeKind } from "@/lib/api/types";
import type { NodeRole } from "@/lib/career-tree/types";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

type NodeQuickViewModalProps = {
  node: ApiNodeListItem | null;
  role: NodeRole;
  childrenCount: number;
  onOpenChange: (open: boolean) => void;
  onAddChild: (parentId: string, name: string, kind: NodeKind) => void;
  onViewDetail: (nodeId: string) => void;
};

// Modal xem nhanh cho node kind BRANCH/root - cac node nay khong dieu huong
// sang trang chi tiet khi click tren canvas (xem career-tree-canvas.tsx),
// nen can 1 lop thong tin so luoc + loi tao node con ngay tai cho thay vi
// bat nguoi dung phai mo trang chi tiet chi de them 1 nhanh con.
const NodeQuickViewModal = ({
  node,
  role,
  childrenCount,
  onOpenChange,
  onAddChild,
  onViewDetail,
}: NodeQuickViewModalProps) => {
  const open = node !== null;
  const Icon = ROLE_ICON[role];
  const done = node ? Math.min(node.cardCount, MAX_EXPECTED_CARDS) : 0;
  const percent = done > 0 ? Math.min(100, (done / MAX_EXPECTED_CARDS) * 100) : 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-panel focus:outline-none">
          {node && (
            <>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                  <Icon
                    size={17}
                    strokeWidth={1.75}
                    className="text-icon-active"
                  />
                </span>
                <Dialog.Title className="truncate text-base font-medium text-ink">
                  {node.title}
                </Dialog.Title>
              </div>

              {node.goal ? (
                <p className="mt-3 text-sm text-ink-muted">{node.goal}</p>
              ) : (
                <p className="mt-3 text-sm text-ink-faint italic">
                  Chưa có mô tả.
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-ink-faint">
                  {done}/{MAX_EXPECTED_CARDS}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <GitBranch size={13} strokeWidth={1.75} />
                  {childrenCount} nhánh
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <NotebookPen size={13} strokeWidth={1.75} />
                  {node.cardCount} ghi chú
                </span>
                <LearningStreak
                  streak={node.streak}
                  lastActivity={node.lastActivity}
                  variant="inline"
                />
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <AddChildBox
                  onAddChild={(name, kind) => onAddChild(node.id, name, kind)}
                />
              </div>

              <button
                type="button"
                onClick={() => onViewDetail(node.id)}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                Xem trang chi tiết đầy đủ
                <ArrowUpRight size={14} strokeWidth={1.75} />
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NodeQuickViewModal;
