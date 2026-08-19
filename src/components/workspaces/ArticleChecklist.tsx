"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Brain,
  BookOpen,
  CheckSquare,
  CircleDashed,
  FlaskConical,
  History,
  Pencil,
  Plus,
  Square,
  Target,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type {
  ApiChecklistItem,
  ApiChecklistItemLog,
  ChecklistGroup,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SimpleModal } from "@/components/ui/simple-modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { listChecklistItemsAction } from "@/actions/checklist/list-checklist-items";
import { createChecklistItemAction } from "@/actions/checklist/create-checklist-item";
import { updateChecklistItemAction } from "@/actions/checklist/update-checklist-item";
import { updateChecklistStatusAction } from "@/actions/checklist/update-checklist-status";
import { deleteChecklistItemAction } from "@/actions/checklist/delete-checklist-item";
import { listChecklistItemLogsAction } from "@/actions/checklist/list-checklist-item-logs";
import { updateDocumentAction } from "@/actions/documents/update-document";
import { STATUS_COLOR, STATUS_ICON, STATUS_LABEL, nextStatus } from "./checklist-status";

// 4 section co dinh cua "Ke hoach hoc tap" - moi ChecklistItem thuoc DUNG 1
// section (field `group`, xem schema.prisma). OBJECTIVE la mac dinh nen cac
// item tao TRUOC khi co field nay deu roi vao "Cần nắm", khong can backfill.
const SECTIONS: {
  key: ChecklistGroup;
  icon: LucideIcon;
  label: string;
  addLabel: string;
  placeholder: string;
}[] = [
  { key: "OBJECTIVE", icon: Target, label: "Cần nắm", addLabel: "Thêm mục tiêu", placeholder: "VD: Phân biệt User và Role" },
  { key: "RESOURCE", icon: BookOpen, label: "Tài liệu", addLabel: "Thêm tài liệu", placeholder: "VD: AWS IAM User Guide" },
  { key: "PRACTICE", icon: FlaskConical, label: "Thực hành", addLabel: "Thêm bài thực hành", placeholder: "VD: Policy Simulator" },
  { key: "ASSESSMENT", icon: Brain, label: "Kiểm tra", addLabel: "Thêm mục kiểm tra", placeholder: "VD: Tự giải thích IAM Role" },
];

// "Ke hoach hoc tap" gan tren bai viet - tac gia liet ke tung muc theo 4
// section (Can nam/Tai lieu/Thuc hanh/Kiem tra), tu danh dau trang thai (4
// muc, khong chi bam/chua) + ghi note ngan. Truoc day goi la "Checklist kien
// thuc", 1 danh sach phang 2 trang thai - doi ten + chia section theo phan
// hoi nguoi dung (khong con phu hop khi noi dung thuc te gom ca tai lieu/bai
// thuc hanh, khong chi "muc can hieu"). Trang thai/note LUON hien voi nguoi
// doc khac (read-only, khong bam duoc); CHI lich su doi trang thai (nut
// History o moi hang) bi gate boi `logPublic` (tac gia bat/tat qua
// Document.checklistLogPublic). Khong nhung vao Tiptap content - render bang
// React thuong, doc lap voi editor, xem ArticleReaderPane.tsx.
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
  const [addingGroup, setAddingGroup] = useState<ChecklistGroup | null>(null);
  const [addingLabel, setAddingLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  // Xoa 1/nhieu muc - che do chon (checkbox thay cho icon trang thai o moi
  // hang) + 1 modal xac nhan DUNG CHUNG cho ca xoa-1 (icon thung rac tren
  // hang) lan xoa-nhieu (thanh hanh dong khi selectMode), tranh xoa nham vi
  // day la hanh dong khong hoan tac duoc. Ap dung XUYEN SUOT ca 4 section
  // (1 che do chon chung, khong tach rieng tung section).
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

  const itemsByGroup = useMemo(() => {
    const map = new Map<ChecklistGroup, ApiChecklistItem[]>(
      SECTIONS.map((s) => [s.key, []]),
    );
    for (const item of items ?? []) map.get(item.group)?.push(item);
    return map;
  }, [items]);

  if (items === null) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[13px] border border-border bg-surface-muted/40 py-8">
        <CircleDashed size={15} strokeWidth={1.9} className="animate-spin text-ink-faint" />
        <span className="text-[12px] text-ink-faint">Đang tải kế hoạch học tập...</span>
      </div>
    );
  }
  // Reader (khong phai owner) + chua co muc nao -> an han ca card, tranh 1
  // khung trong vo nghia voi nguoi doc.
  if (items.length === 0 && !isOwner) return null;

  function addItem() {
    // Chan double-submit: Enter roi onBlur (hoac bam nhanh 2 lan) co the goi
    // ham nay 2 lan lien tiep truoc khi isPending kip cap nhat lai UI.
    if (isPending || !addingGroup) return;
    const group = addingGroup;
    const label = addingLabel.trim();
    if (!label) {
      setAddingGroup(null);
      setAddingLabel("");
      return;
    }
    startTransition(async () => {
      const created = await createChecklistItemAction(documentId, { label, group });
      setItems((prev) => [...(prev ?? []), created]);
      setAddingGroup(null);
      setAddingLabel("");
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
  const percent = items.length > 0 ? Math.round((understoodCount / items.length) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-[13px] border border-border bg-surface-muted/40">
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
            <Brain size={15} strokeWidth={1.9} className="shrink-0" />
            Kế hoạch học tập
          </span>
          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <ProgressBar percent={percent} className="max-w-40 flex-1" />
              <span className="shrink-0 text-[11px] text-ink-faint">
                {understoodCount}/{items.length} đã nắm
              </span>
            </div>
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
        {SECTIONS.map((section) => {
          const sectionItems = itemsByGroup.get(section.key) ?? [];
          if (sectionItems.length === 0 && !isOwner) return null;
          const SectionIcon = section.icon;
          return (
            <div key={section.key} className="px-4 py-3">
              <span
                className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-wide"
                style={{ color: "var(--ink-faint)" }}
              >
                <SectionIcon size={11} strokeWidth={2} className="shrink-0" />
                {section.label.toUpperCase()}
              </span>

              <div className="flex flex-col divide-y divide-border">
                {sectionItems.map((item) => (
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
                <div className="pt-1.5">
                  {addingGroup === section.key ? (
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
                          if (e.key === "Escape") {
                            setAddingGroup(null);
                            setAddingLabel("");
                          }
                        }}
                        onBlur={addItem}
                        placeholder={section.placeholder}
                        disabled={isPending}
                        className="h-8 min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 pr-7 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
                      />
                      {isPending && (
                        <CircleDashed
                          size={13}
                          strokeWidth={2}
                          className="pointer-events-none absolute right-2.5 animate-spin text-ink-faint"
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingGroup(section.key);
                        setAddingLabel("");
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-[11.5px] font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-primary"
                    >
                      <Plus size={12} strokeWidth={2} />
                      {section.addLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(item.label);
  const [logOpen, setLogOpen] = useState(false);
  const [logs, setLogs] = useState<ApiChecklistItemLog[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const StatusIcon = STATUS_ICON[item.status];
  const understood = item.status === "UNDERSTOOD";

  function cycleStatus() {
    if (!isOwner) return;
    startTransition(async () => {
      const updated = await updateChecklistStatusAction(item.id, nextStatus(item.status));
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

  // Sua nhanh nhan bai (vd go thieu chu so) - truoc day CHI sua duoc note,
  // muon doi label phai xoa roi them lai muc moi.
  function saveLabel() {
    const trimmed = labelDraft.trim();
    if (!trimmed || trimmed === item.label) {
      setLabelDraft(item.label);
      setEditingLabel(false);
      return;
    }
    startTransition(async () => {
      const updated = await updateChecklistItemAction(item.id, { label: trimmed });
      onChanged(updated);
      setEditingLabel(false);
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
        "group py-2 transition-colors duration-150 ease-out",
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
            onClick={cycleStatus}
            disabled={!isOwner || isPending}
            title={`${STATUS_LABEL[item.status]}${isOwner ? " — bấm để đổi trạng thái" : ""}`}
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center",
              isOwner ? "cursor-pointer" : "cursor-default",
            )}
            style={{ color: STATUS_COLOR[item.status] }}
          >
            <StatusIcon size={16} strokeWidth={1.9} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {editingLabel ? (
              <input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveLabel();
                  }
                  if (e.key === "Escape") {
                    setLabelDraft(item.label);
                    setEditingLabel(false);
                  }
                }}
                onBlur={saveLabel}
                onClick={(e) => e.stopPropagation()}
                disabled={isPending}
                className="h-7 min-w-0 flex-1 rounded-md border border-border bg-surface px-2 text-[13px] font-medium text-ink outline-none focus:border-primary/50"
              />
            ) : (
              <span
                className={cn(
                  "text-[13px] font-medium",
                  understood && "text-ink-muted line-through decoration-1",
                )}
                style={!understood ? { color: "var(--ink)" } : undefined}
              >
                {item.label}
              </span>
            )}
            {!selectMode && !editingLabel && (
              <span className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
                {isOwner && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLabelDraft(item.label);
                      setEditingLabel(true);
                    }}
                    title="Sửa"
                    className="flex size-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover-bg hover:text-ink"
                  >
                    <Pencil size={12} strokeWidth={1.9} />
                  </button>
                )}
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
            <>
              {/* Preview gon (line-clamp) thay vi textarea nhoi truc tiep vao
                  hang - go/doc ghi chu dai trong 1 o be tin vua kho doc lai
                  kho go (nguoi dung phan anh "quá bé"), mo modal rong rai
                  hon de sua that su. */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNoteModalOpen(true);
                }}
                className="mt-1 flex w-full cursor-pointer items-start rounded px-1 py-0.5 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                {note ? (
                  <span className="line-clamp-2 text-[12px] text-ink-muted">{note}</span>
                ) : (
                  <span className="text-[12px] text-ink-faint">+ Thêm ghi chú</span>
                )}
              </button>

              <SimpleModal
                open={noteModalOpen}
                onOpenChange={(next) => {
                  if (!next) {
                    setNote(item.note ?? "");
                    setNoteModalOpen(false);
                  }
                }}
                title="Ghi chú"
                description={item.label}
              >
                <div className="flex flex-col gap-3">
                  <textarea
                    autoFocus
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Rút ra được điều gì?"
                    rows={8}
                    className="w-full resize-none rounded-md border border-border bg-surface p-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNote(item.note ?? "");
                        setNoteModalOpen(false);
                      }}
                      className="h-9 cursor-pointer rounded-md border border-border px-4 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        saveNote();
                        setNoteModalOpen(false);
                      }}
                      className="h-9 cursor-pointer rounded-md bg-community-accent px-4 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </SimpleModal>
            </>
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
                      style={{ color: STATUS_COLOR[log.toStatus] }}
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
