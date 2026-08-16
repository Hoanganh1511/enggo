"use client";

import { useState, useTransition } from "react";
import { createSeriesAction } from "@/actions/series/create-series";
import { SimpleModal } from "@/components/ui/simple-modal";
import type { ApiSeries } from "@/lib/api/types";

// Dung chung cho 2 luong tao DocumentSeries - "Thêm bài viết cùng chủ đề"
// (ArticleReaderPane.tsx, documentIds = [1 bai dang xem]) va "Gộp thành 1 nhóm"
// tu che do chon nhieu bai (WorkspaceMain.tsx, documentIds = cac bai da chon).
export function CreateSeriesModal({
  open,
  onOpenChange,
  groupId,
  documentIds,
  defaultName = "",
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  documentIds: string[];
  defaultName?: string;
  onCreated: (series: ApiSeries) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName(defaultName);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const series = await createSeriesAction(groupId, {
          name: name.trim(),
          documentIds,
        });
        onCreated(series);
        onOpenChange(false);
        resetForm();
      } catch {
        setError("Không tạo được nhóm bài viết, thử lại sau.");
      }
    });
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
      title="Nhóm bài viết cùng chủ đề"
      description={`Gộp ${documentIds.length} bài viết vào 1 nhóm - đặt tên để bắt đầu.`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="series-name"
            className="text-xs font-semibold text-ink"
          >
            Tên nhóm
          </label>
          <input
            id="series-name"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Series học IAM"
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-community-accent"
          />
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 h-9 cursor-pointer rounded-md bg-community-accent text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Đang tạo..." : "Tạo nhóm"}
        </button>
      </form>
    </SimpleModal>
  );
}
