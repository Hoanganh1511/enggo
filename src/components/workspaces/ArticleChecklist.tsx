"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CheckCircle2,
  CheckSquare,
  Circle,
  History,
  ListChecks,
  LoaderCircle,
  Plus,
  Square,
  Trash2,
  X,
} from "lucide-react";
import type { ApiChecklistItem, ApiChecklistItemLog } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { listChecklistItemsAction } from "@/actions/checklist/list-checklist-items";
import { createChecklistItemAction } from "@/actions/checklist/create-checklist-item";
import { updateChecklistItemAction } from "@/actions/checklist/update-checklist-item";
import { updateChecklistStatusAction } from "@/actions/checklist/update-checklist-status";
import { deleteChecklistItemAction } from "@/actions/checklist/delete-checklist-item";
import { listChecklistItemLogsAction } from "@/actions/checklist/list-checklist-item-logs";
import { updateDocumentAction } from "@/actions/documents/update-document";

const STATUS_LABEL: Record<ApiChecklistItem["status"], string> = {
  NOT_UNDERSTOOD: "Chưa hiểu",
  UNDERSTOOD: "Đã hiểu",
};

// "Nhat ky hoc" cong khai gan tren bai viet - tac gia liet ke tung topic can
// nam, tu danh dau hieu/chua + ghi note ngan. Trang thai/note LUON hien voi
// nguoi doc khac (read-only, khong bam duoc); CHI lich su doi trang thai
// (nut History o moi hang) bi gate boi `logPublic` (tac gia bat/tat qua
// Document.checklistLogPublic). Khong nhung vao Tiptap content - render
// bang React thuong, doc lap voi editor, xem ArticleReaderPane.tsx.
export function ArticleChecklist({
  documentId,
  isOwner,
  logPublic,
  onLogPublicChange,
}: {
  documentId: string;
  isOwner: boolean;
  logPublic: boolean;
  onLogPublicChange: (next: boolean) => void;
}) {
  const [items, setItems] = useState<ApiChecklistItem[] | null>(null);
  const [addingLabel, setAddingLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Xoa 1/nhieu muc - che do chon (checkbox thay cho icon trang thai o moi
  // hang) + 1 modal xac nhan DUNG CHUNG cho ca xoa-1 (icon thung rac tren
  // hang) lan xoa-nhieu (thanh hanh dong khi selectMode), tranh xoa nham vi
  // day la hanh dong khong hoan tac duoc.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    listChecklistItemsAction(documentId).then((res) => {
      if (!cancelled) setItems(res);
    });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  if (items === null) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[13px] border border-border bg-surface-muted/40 py-8">
        <LoaderCircle size={15} strokeWidth={1.9} className="animate-spin text-ink-faint" />
        <span className="text-[12px] text-ink-faint">Đang tải checklist...</span>
      </div>
    );
  }
  // Reader (khong phai owner) + chua co muc nao -> an han ca card, tranh 1
  // khung trong vo nghia voi nguoi doc.
  if (items.length === 0 && !isOwner) return null;

  function addItem() {
    // Chan double-submit: Enter roi onBlur (hoac bam nhanh 2 lan) co the goi
    // ham nay 2 lan lien tiep truoc khi isPending kip cap nhat lai UI.
    if (isPending) return;
    const label = addingLabel?.trim();
    if (!label) {
      setAddingLabel(null);
      return;
    }
    startTransition(async () => {
      const created = await createChecklistItemAction(documentId, { label });
      setItems((prev) => [...(prev ?? []), created]);
      setAddingLabel(null);
    });
  }

  function toggleLogPublic() {
    startTransition(async () => {
      await updateDocumentAction(documentId, { checklistLogPublic: !logPublic });
      onLogPublicChange(!logPublic);
    });
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmDelete() {
    if (!confirmDeleteIds) return;
    await Promise.all(confirmDeleteIds.map((id) => deleteChecklistItemAction(id)));
    const removed = new Set(confirmDeleteIds);
    setItems((prev) => (prev ?? []).filter((i) => !removed.has(i.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      confirmDeleteIds.forEach((id) => next.delete(id));
      return next;
    });
  }

  const understoodCount = items.filter((i) => i.status === "UNDERSTOOD").length;

  return (
    <div className="overflow-hidden rounded-[13px] border border-border bg-surface-muted/40">
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
            <ListChecks size={15} strokeWidth={1.9} className="shrink-0" />
            Checklist kiến thức
          </span>
          {items.length > 0 && (
            <span className="text-[11px] text-ink-faint">
              {understoodCount}/{items.length} đã hiểu
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {isOwner && (
            <button
              type="button"
              onClick={toggleLogPublic}
              disabled={isPending}
              title="Bật/tắt hiển thị lịch sử checklist cho người đọc khác"
              className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-ink disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "flex h-4 w-7 shrink-0 items-center rounded-full px-0.5 transition-colors duration-150 ease-out",
                  logPublic ? "justify-end bg-community-accent" : "justify-start bg-border",
                )}
              >
                <span className="size-3 rounded-full bg-white" />
              </span>
              Công khai nhật ký
            </button>
          )}
          {isOwner && items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectMode((v) => !v);
                setSelectedIds(new Set());
              }}
              className="flex shrink-0 cursor-pointer items-center gap-1 text-[11px] font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-ink"
            >
              {selectMode ? (
                <>
                  <X size={12} strokeWidth={2} />
                  Huỷ
                </>
              ) : (
                <>
                  <CheckSquare size={12} strokeWidth={1.9} />
                  Chọn để xoá
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            isOwner={isOwner}
            logVisible={isOwner || logPublic}
            selectMode={selectMode}
            selected={selectedIds.has(item.id)}
            onToggleSelect={() => toggleSelected(item.id)}
            onChanged={(updated) =>
              setItems((prev) =>
                (prev ?? []).map((i) => (i.id === updated.id ? updated : i)),
              )
            }
            onRequestDelete={() => setConfirmDeleteIds([item.id])}
          />
        ))}
      </div>

      {isOwner && !selectMode && (
        <div className="p-2">
          {addingLabel === null ? (
            <button
              type="button"
              onClick={() => setAddingLabel("")}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-[12px] font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-primary"
            >
              <Plus size={13} strokeWidth={2} />
              Thêm mục
            </button>
          ) : (
            <div className="relative flex items-center gap-1.5">
              <input
                autoFocus
                value={addingLabel}
                onChange={(e) => setAddingLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                  if (e.key === "Escape") setAddingLabel(null);
                }}
                onBlur={addItem}
                placeholder="VD: Version"
                disabled={isPending}
                className="h-8 min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 pr-7 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
              />
              {isPending && (
                <LoaderCircle
                  size={13}
                  strokeWidth={2}
                  className="pointer-events-none absolute right-2.5 animate-spin text-ink-faint"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Thanh hanh dong khi selectMode + co it nhat 1 muc duoc chon. */}
      {selectMode && selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
          <span className="text-[11px] font-medium text-ink-muted">
            Đã chọn {selectedIds.size} mục
          </span>
          <button
            type="button"
            onClick={() => setConfirmDeleteIds([...selectedIds])}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Trash2 size={12} strokeWidth={2} />
            Xoá
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmDeleteIds !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmDeleteIds(null);
        }}
        title={
          confirmDeleteIds && confirmDeleteIds.length > 1
            ? `Xoá ${confirmDeleteIds.length} mục checklist?`
            : "Xoá mục checklist?"
        }
        description="Không thể hoàn tác — mục và lịch sử của nó sẽ bị xoá hoàn toàn."
        confirmLabel="Xoá"
        danger
        onConfirm={async () => {
          await confirmDelete();
          setConfirmDeleteIds(null);
          setSelectMode(false);
        }}
      />
    </div>
  );
}

function ChecklistRow({
  item,
  isOwner,
  logVisible,
  selectMode,
  selected,
  onToggleSelect,
  onChanged,
  onRequestDelete,
}: {
  item: ApiChecklistItem;
  isOwner: boolean;
  logVisible: boolean;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onChanged: (item: ApiChecklistItem) => void;
  onRequestDelete: () => void;
}) {
  const [note, setNote] = useState(item.note ?? "");
  const [logOpen, setLogOpen] = useState(false);
  const [logs, setLogs] = useState<ApiChecklistItemLog[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const understood = item.status === "UNDERSTOOD";

  function toggleStatus() {
    if (!isOwner) return;
    startTransition(async () => {
      const updated = await updateChecklistStatusAction(
        item.id,
        understood ? "NOT_UNDERSTOOD" : "UNDERSTOOD",
      );
      onChanged(updated);
    });
  }

  function saveNote() {
    if (note === (item.note ?? "")) return;
    startTransition(async () => {
      const updated = await updateChecklistItemAction(item.id, { note });
      onChanged(updated);
    });
  }

  function toggleLog() {
    if (!logVisible) return;
    if (!logOpen && logs === null) {
      startTransition(async () => {
        setLogs(await listChecklistItemLogsAction(item.id));
      });
    }
    setLogOpen((v) => !v);
  }

  return (
    <div
      className={cn(
        "group px-4 py-2.5 transition-colors duration-150 ease-out",
        selectMode && "cursor-pointer hover:bg-hover-bg",
      )}
      onClick={selectMode ? onToggleSelect : undefined}
    >
      <div className="flex items-start gap-2.5">
        {selectMode ? (
          <span
            className="mt-0.5 flex shrink-0 items-center justify-center"
            style={{ color: selected ? "var(--community-accent)" : "var(--ink-faint)" }}
          >
            {selected ? (
              <CheckSquare size={16} strokeWidth={2} />
            ) : (
              <Square size={16} strokeWidth={1.9} />
            )}
          </span>
        ) : (
          <button
            type="button"
            onClick={toggleStatus}
            disabled={!isOwner || isPending}
            title={STATUS_LABEL[item.status]}
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center",
              isOwner ? "cursor-pointer" : "cursor-default",
            )}
            style={{ color: understood ? "var(--success)" : "var(--ink-faint)" }}
          >
            {understood ? (
              <CheckCircle2 size={16} strokeWidth={2} />
            ) : (
              <Circle size={16} strokeWidth={1.9} />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[13px] font-medium",
                understood && "text-ink-muted line-through decoration-1",
              )}
              style={!understood ? { color: "var(--ink)" } : undefined}
            >
              {item.label}
            </span>
            {!selectMode && (
              <span className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
                {logVisible && (
                  <button
                    type="button"
                    onClick={toggleLog}
                    title="Xem lịch sử"
                    className="flex size-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover-bg hover:text-ink"
                  >
                    <History size={12} strokeWidth={1.9} />
                  </button>
                )}
                {isOwner && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDelete();
                    }}
                    title="Xoá mục"
                    className="flex size-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={12} strokeWidth={1.9} />
                  </button>
                )}
              </span>
            )}
          </div>

          {isOwner && !selectMode ? (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              onClick={(e) => e.stopPropagation()}
              placeholder="Ghi chú — rút ra được điều gì?"
              rows={1}
              className="mt-1 w-full resize-none border-none bg-transparent text-[12px] text-ink-muted outline-none placeholder:text-ink-faint"
            />
          ) : (
            item.note && (
              <p className="mt-1 text-[12px] text-ink-muted">{item.note}</p>
            )
          )}

          {logOpen && !selectMode && (
            <div className="mt-2 flex flex-col gap-1 border-l-2 border-border pl-2.5">
              {logs === null ? (
                <span className="text-[11px] text-ink-faint">Đang tải...</span>
              ) : logs.length === 0 ? (
                <span className="text-[11px] text-ink-faint">Chưa có lịch sử.</span>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="text-[11px]">
                    <span
                      className="font-medium"
                      style={{
                        color:
                          log.toStatus === "UNDERSTOOD"
                            ? "var(--success)"
                            : "var(--ink-faint)",
                      }}
                    >
                      {STATUS_LABEL[log.toStatus]}
                    </span>{" "}
                    <span className="text-ink-faint">
                      · {formatRelativeTime(log.createdAt)}
                    </span>
                    {log.note && (
                      <p className="mt-0.5 text-ink-muted">{log.note}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
