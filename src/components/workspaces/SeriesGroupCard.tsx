"use client";

import { useState, useTransition } from "react";
import { Check, Layers, ListPlus, Pencil, X } from "lucide-react";
import type { ApiDocumentSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { updateSeriesAction } from "@/actions/series/update-series";
import { useWorkspaceShell } from "./workspace-shell-context";
import { ArticleCard } from "./ArticleCard";
import { ManageSeriesDocumentsModal } from "./ManageSeriesDocumentsModal";

// Box gop nhieu bai viet "cung chu de" (DocumentSeries) trong danh sach -
// vien mo/net dut + ten nhom tuy chinh o header, cac bai ben trong van la
// ArticleCard binh thuong (giu nguyen so #N global, xem publishOrder trong
// WorkspaceMain.tsx). Doi ten goi thang updateSeriesAction roi refreshGroupDocs()
// (groupDocs la client state trong WorkspaceShell, khong qua Next cache) thay
// vi tu patch local - don gian hon, chap nhan 1 round-trip fetch them.
export function SeriesGroupCard({
  seriesId,
  seriesName,
  docs,
  publishOrder,
  username,
  workspaceId,
  canEdit,
  activeDocId,
}: {
  seriesId: string;
  seriesName: string;
  docs: ApiDocumentSummary[];
  publishOrder: Map<string, number>;
  username: string;
  workspaceId: string;
  canEdit: boolean;
  // Bai dang MO trong ArticleReaderPane (xem ArticleCard.tsx) - truyen xuong
  // tung ArticleCard con de ca bai NAM TRONG 1 series cung duoc highlight
  // dung khi dang doc no (GroupArticleToc.tsx).
  activeDocId?: string;
}) {
  const { refreshGroupDocs } = useWorkspaceShell();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(seriesName);
  const [isSaving, startTransition] = useTransition();
  const [manageOpen, setManageOpen] = useState(false);

  function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === seriesName) {
      setDraft(seriesName);
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await updateSeriesAction(seriesId, { name: trimmed });
      refreshGroupDocs();
      setEditing(false);
    });
  }

  function cancel() {
    setDraft(seriesName);
    setEditing(false);
  }

  return (
    <div className="my-1.5 overflow-hidden rounded-xl border border-dashed border-border/70 bg-surface-muted/40 p-2">
      <div className="mb-1 flex items-center gap-1.5 px-1.5 py-0.5">
        <Layers size={13} strokeWidth={2} className="shrink-0 text-ink-faint" />
        {editing ? (
          <>
            <input
              autoFocus
              value={draft}
              disabled={isSaving}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
                if (e.key === "Escape") cancel();
              }}
              className="min-w-0 flex-1 border-none bg-transparent text-xs font-semibold text-ink outline-none"
            />
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="shrink-0 cursor-pointer text-ink-faint hover:text-primary"
              title="Lưu"
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={isSaving}
              className="shrink-0 cursor-pointer text-ink-faint hover:text-danger"
              title="Huỷ"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-muted">
              {seriesName}
            </span>
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="shrink-0 cursor-pointer text-ink-faint hover:text-primary"
                  title="Quản lý bài viết trong nhóm"
                >
                  <ListPlus size={13} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="shrink-0 cursor-pointer text-ink-faint hover:text-primary"
                  title="Đổi tên nhóm"
                >
                  <Pencil size={11} strokeWidth={2} />
                </button>
              </>
            )}
          </>
        )}
      </div>
      <div className={cn("flex flex-col", isSaving && "opacity-60")}>
        {docs.map((d) => (
          <ArticleCard
            key={d.id}
            doc={d}
            index={publishOrder.get(d.id) ?? 0}
            username={username}
            workspaceId={workspaceId}
            active={d.id === activeDocId}
          />
        ))}
      </div>

      {canEdit && (
        <ManageSeriesDocumentsModal
          open={manageOpen}
          onOpenChange={setManageOpen}
          seriesId={seriesId}
          seriesName={seriesName}
        />
      )}
    </div>
  );
}
