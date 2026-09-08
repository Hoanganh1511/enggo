"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, NotebookText, Pencil, Plus, Trash2 } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { SimpleModal } from "@/components/ui/simple-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import type { ApiDiaryTopic } from "@/lib/api/types";

const ACCENT = "#0ea5e9";

// Sidebar "chu de" cua GL Daily Diary - nguoi dung (admin) tu tao/sua/xoa,
// khong hardcode san danh sach (xem plan). Chi 1 admin duy nhat dung nen
// khong can hien avatar/owner gi them, chi ten + so bai viet.
export function DiaryTopicSidebar({
  topics,
  selectedTopicId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  topics: ApiDiaryTopic[];
  selectedTopicId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [renameTarget, setRenameTarget] = useState<ApiDiaryTopic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiDiaryTopic | null>(null);

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      await onCreate(name);
      setNewName("");
      setCreating(false);
    });
  }

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h2 className="text-sm font-bold text-ink">Chủ đề</h2>
        <button
          type="button"
          title="Chủ đề mới"
          onClick={() => setCreating((v) => !v)}
          className="grid size-7 cursor-pointer place-items-center rounded-full text-white transition-colors duration-150 ease-out hover:brightness-105"
          style={{ background: ACCENT }}
        >
          <Plus size={15} strokeWidth={2.25} />
        </button>
      </div>

      {creating && (
        <form onSubmit={submitCreate} className="px-4 pb-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên chủ đề..."
            disabled={isPending}
            onBlur={() => {
              if (!newName.trim()) setCreating(false);
            }}
            className="h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {topics.length === 0 && !creating && (
          <p className="px-2 py-6 text-center text-xs text-ink-faint">
            Chưa có chủ đề nào — bấm + để tạo.
          </p>
        )}
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-left",
              selectedTopicId === topic.id
                ? "bg-hover-bg"
                : "hover:bg-hover-bg/60",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(topic.id)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
            >
              <NotebookText
                size={14}
                strokeWidth={2}
                className="shrink-0"
                style={{
                  color: selectedTopicId === topic.id ? ACCENT : undefined,
                }}
              />
              <span
                className={cn(
                  "truncate text-[13px]",
                  selectedTopicId === topic.id
                    ? "font-semibold text-ink"
                    : "text-ink-muted",
                )}
              >
                {topic.name}
              </span>
            </button>

            <PopoverRoot>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-ink-faint opacity-0 transition-opacity duration-150 hover:bg-surface group-hover:opacity-100"
                >
                  <MoreHorizontal size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent open align="end" sideOffset={4}>
                <div className="w-36 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
                  <button
                    type="button"
                    onClick={() => setRenameTarget(topic)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink hover:bg-hover-bg"
                  >
                    <Pencil size={13} /> Đổi tên
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(topic)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={13} /> Xoá
                  </button>
                </div>
              </PopoverContent>
            </PopoverRoot>
          </div>
        ))}
      </div>

      <RenameTopicModal
        topic={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onRename={onRename}
      />
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xoá chủ đề "${deleteTarget?.name}"?`}
        description="Toàn bộ bài viết trong chủ đề này sẽ bị xoá vĩnh viễn."
        confirmLabel="Xoá"
        danger
        onConfirm={async () => {
          if (deleteTarget) await onDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}

function RenameTopicModal({
  topic,
  onOpenChange,
  onRename,
}: {
  topic: ApiDiaryTopic | null;
  onOpenChange: (open: boolean) => void;
  onRename: (id: string, name: string) => Promise<void>;
}) {
  const [name, setName] = useState(topic?.name ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <SimpleModal
      key={topic?.id}
      open={topic !== null}
      onOpenChange={onOpenChange}
      title="Đổi tên chủ đề"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!topic) return;
          const trimmed = name.trim();
          if (!trimmed) return;
          startTransition(async () => {
            await onRename(topic.id, trimmed);
            onOpenChange(false);
          });
        }}
        className="flex flex-col gap-3"
      >
        <input
          autoFocus
          defaultValue={topic?.name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-9 cursor-pointer self-end rounded-md px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: ACCENT }}
        >
          {isPending ? "Đang lưu..." : "Lưu"}
        </button>
      </form>
    </SimpleModal>
  );
}
