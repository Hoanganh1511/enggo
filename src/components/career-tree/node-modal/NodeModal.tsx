"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, type LucideIcon } from "lucide-react";
import EditorPane from "./EditorPane";
import ActivityLog, { type Activity } from "./ActivityLog";
import AddChildBox from "./AddChildBox";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

type NodeModalProps = {
  open: boolean;
  onClose: () => void;
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
  };
  onContentChange: (json: Record<string, unknown>) => void;
  onAddChild: (name: string) => void;
  onDelete: () => void;
  onAddActivity: (text: string) => void;
};

const NodeModal = ({
  open,
  onClose,
  node,
  onContentChange,
  onAddChild,
  onDelete,
  onAddActivity,
}: NodeModalProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const Icon = node.icon;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[560px] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon size={16} strokeWidth={1.75} className="text-gray-900" />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-base font-medium text-gray-900">
                  {node.title}
                </Dialog.Title>
                <p className="truncate text-xs tabular-nums text-gray-500">
                  {node.subtitle} · {node.branches} nhánh · {node.done}/{node.total}
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid flex-1 grid-cols-[1fr_300px] gap-6 overflow-hidden p-6">
            <EditorPane content={node.content} onContentChange={onContentChange} />
            <div className="flex flex-col gap-6 overflow-y-auto">
              <ActivityLog activities={node.activities} onAddActivity={onAddActivity} />
              <AddChildBox onAddChild={onAddChild} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">
              Cập nhật lần cuối: {formatRelativeTime(node.updatedAt)}
            </p>
            {confirmingDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">
                  Xoá node và {node.branches} nhánh con?
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-lg px-2 py-1 text-gray-500 transition-colors hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg bg-red-600 px-2 py-1 text-white transition-colors hover:bg-red-700"
                >
                  Xoá vĩnh viễn
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-xs text-gray-400 transition-colors hover:text-red-600"
              >
                Xoá node này
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NodeModal;
