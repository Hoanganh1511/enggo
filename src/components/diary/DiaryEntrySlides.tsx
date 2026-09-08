"use client";

import { useState, useTransition } from "react";
import { CalendarDays, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { HorizontalScroller } from "@/components/discover/home-feed/HorizontalScroller";
import { SimpleModal } from "@/components/ui/simple-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { ApiDiaryEntry } from "@/lib/api/types";
import type { DiaryEntryInput } from "@/lib/api/diary";

const ACCENT = "#0ea5e9";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

// Cac "trang" nhat ky cua 1 chu de - cuon NGANG (snap-center, cam giac lat
// trang ro hon snap-start mac dinh cua HorizontalScroller), moi slide gan
// full-width khung hien co. Tai dung HorizontalScroller (component scroll-
// snap dung chung, xem home-feed/) thay vi viet lai carousel rieng.
export function DiaryEntrySlides({
  topicName,
  entries,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  topicName: string | null;
  entries: ApiDiaryEntry[];
  loading: boolean;
  onCreate: (dto: DiaryEntryInput) => Promise<void>;
  onUpdate: (id: string, dto: DiaryEntryInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiDiaryEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiDiaryEntry | null>(null);

  if (!topicName) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
        Chọn hoặc tạo 1 chủ đề để bắt đầu viết.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden px-6 py-5">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-base font-bold text-ink">{topicName}</h1>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:brightness-105"
          style={{ background: ACCENT }}
        >
          <Plus size={14} strokeWidth={2.25} /> Bài viết mới
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
          Đang tải...
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
          Chưa có bài viết nào trong chủ đề này.
        </div>
      ) : (
        <HorizontalScroller>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex w-[min(560px,88vw)] shrink-0 snap-center flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                {/* font-content: ngay/tieu de/noi dung entry la NOI DUNG doc
                    lai, dung Manrope - menu Sua/Xoa ben canh la UI. */}
                <div className="font-content flex items-center gap-1.5 text-xs font-medium text-ink-faint">
                  <CalendarDays size={13} style={{ color: ACCENT }} />
                  {formatDate(entry.entryDate)}
                </div>
                <PopoverRoot>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-ink-faint hover:bg-hover-bg"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent open align="end" sideOffset={4}>
                    <div className="w-32 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
                      <button
                        type="button"
                        onClick={() => setEditTarget(entry)}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink hover:bg-hover-bg"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(entry)}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-danger hover:bg-danger/10"
                      >
                        <Trash2 size={13} /> Xoá
                      </button>
                    </div>
                  </PopoverContent>
                </PopoverRoot>
              </div>

              <h2 className="font-content mt-3 text-lg font-bold text-ink">
                {entry.title}
              </h2>
              <p className="font-content mt-3 flex-1 overflow-y-auto text-[13px] leading-relaxed whitespace-pre-wrap text-ink-muted">
                {entry.content}
              </p>
            </div>
          ))}
        </HorizontalScroller>
      )}

      <EntryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={onCreate}
      />
      <EntryFormModal
        key={editTarget?.id}
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        initial={editTarget}
        onSubmit={async (dto) => {
          if (editTarget) await onUpdate(editTarget.id, dto);
        }}
      />
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xoá bài viết "${deleteTarget?.title}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={async () => {
          if (deleteTarget) await onDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}

function EntryFormModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ApiDiaryEntry | null;
  onSubmit: (dto: DiaryEntryInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [entryDate, setEntryDate] = useState(
    initial?.entryDate ?? todayInputValue(),
  );
  const [content, setContent] = useState(initial?.content ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Sửa bài viết" : "Bài viết mới"}
      maxWidthClassName="max-w-lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmedTitle = title.trim();
          if (!trimmedTitle || !content.trim()) return;
          startTransition(async () => {
            await onSubmit({ title: trimmedTitle, content, entryDate });
            onOpenChange(false);
            if (!initial) {
              setTitle("");
              setContent("");
              setEntryDate(todayInputValue());
            }
          });
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Tiêu đề</label>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Ngày</label>
          <input
            type="date"
            required
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            disabled={isPending}
            className="h-9 w-fit rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Nội dung</label>
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
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
