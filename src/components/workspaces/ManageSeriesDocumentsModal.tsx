"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import type { ApiDocumentSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { SimpleModal } from "@/components/ui/simple-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { addSeriesDocumentsAction } from "@/actions/series/add-series-documents";
import { removeSeriesDocumentAction } from "@/actions/series/remove-series-document";
import { useWorkspaceShell } from "./workspace-shell-context";

// Modal quan ly thanh vien 1 series - mo tu icon o header SeriesGroupCard.tsx.
// Tim trong `groupDocs` co san (toan bo bai trong DUNG knowledge group hien
// tai, tu useWorkspaceShell()) - khong can endpoint search rieng, vi backend
// von da chi cho gan bai CUNG knowledgeGroupId voi series (xem SeriesService).
// Bai dang thuoc series nay hien dau X (go), bai khac hien dau + (them) - bam
// vao MO TIEP 1 ConfirmModal thay vi thuc hien ngay, tranh go/them nham.
export function ManageSeriesDocumentsModal({
  open,
  onOpenChange,
  seriesId,
  seriesName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  seriesName: string;
}) {
  const { groupDocs, refreshGroupDocs } = useWorkspaceShell();
  const [search, setSearch] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    doc: ApiDocumentSummary;
    type: "add" | "remove";
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groupDocs;
    return groupDocs.filter((d) => d.title.toLowerCase().includes(q));
  }, [groupDocs, search]);

  return (
    <>
      <SimpleModal
        open={open}
        onOpenChange={onOpenChange}
        title="Quản lý bài viết trong nhóm"
        description={`"${seriesName}" - tìm và thêm/gỡ bài viết khỏi nhóm.`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3">
            <Search size={14} strokeWidth={1.9} className="shrink-0 text-ink-faint" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết..."
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-faint">
                Không tìm thấy bài viết phù hợp.
              </p>
            ) : (
              filtered.map((d) => {
                const inGroup = d.series?.id === seriesId;
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-150 ease-out hover:bg-hover-bg"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {d.title}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          doc: d,
                          type: inGroup ? "remove" : "add",
                        })
                      }
                      title={inGroup ? "Gỡ khỏi nhóm" : "Thêm vào nhóm"}
                      className={cn(
                        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ease-out",
                        inGroup
                          ? "text-danger hover:bg-danger/10"
                          : "text-community-accent hover:bg-community-accent/10",
                      )}
                    >
                      {inGroup ? (
                        <X size={14} strokeWidth={2.25} />
                      ) : (
                        <Plus size={14} strokeWidth={2.25} />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SimpleModal>

      <ConfirmModal
        open={!!pendingAction}
        onOpenChange={(next) => {
          if (!next) setPendingAction(null);
        }}
        title={pendingAction?.type === "remove" ? "Gỡ khỏi nhóm?" : "Thêm vào nhóm?"}
        description={
          pendingAction
            ? `"${pendingAction.doc.title}" sẽ ${
                pendingAction.type === "remove" ? "được gỡ khỏi" : "được thêm vào"
              } nhóm "${seriesName}".`
            : undefined
        }
        confirmLabel={pendingAction?.type === "remove" ? "Gỡ khỏi nhóm" : "Thêm vào nhóm"}
        danger={pendingAction?.type === "remove"}
        onConfirm={async () => {
          if (!pendingAction) return;
          if (pendingAction.type === "remove") {
            await removeSeriesDocumentAction(seriesId, pendingAction.doc.id);
          } else {
            await addSeriesDocumentsAction(seriesId, [pendingAction.doc.id]);
          }
          refreshGroupDocs();
        }}
      />
    </>
  );
}
