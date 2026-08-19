"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ApiObjectiveItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { SimpleModal } from "@/components/ui/simple-modal";
import { updateObjectiveItemAction } from "@/actions/objectives/update-objective-item";
import { updateObjectiveItemStatusAction } from "@/actions/objectives/update-objective-item-status";
import { STATUS_COLOR, STATUS_ICON, STATUS_LABEL, nextStatus } from "./checklist-status";

// 1 hang Knowledge/Skill trong GroupGoalsSection.tsx - cung tinh than
// ChecklistRow trong ArticleChecklist.tsx (status xoay vong 4 muc, sua nhan
// inline, note mo modal rieng) nhung KHONG co "lich su cong khai" (khai niem
// checklistLogPublic gan voi Document, khong ap dung cho Objective).
export function ObjectiveItemRow({
  item,
  canEdit,
  onChanged,
  onRequestDelete,
}: {
  item: ApiObjectiveItem;
  canEdit: boolean;
  onChanged: (item: ApiObjectiveItem) => void;
  onRequestDelete: () => void;
}) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(item.label);
  const [note, setNote] = useState(item.note ?? "");
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const StatusIcon = STATUS_ICON[item.status];
  const understood = item.status === "UNDERSTOOD";

  function cycleStatus() {
    if (!canEdit) return;
    startTransition(async () => {
      const updated = await updateObjectiveItemStatusAction(item.id, nextStatus(item.status));
      onChanged(updated);
    });
  }

  function saveLabel() {
    const trimmed = labelDraft.trim();
    if (!trimmed || trimmed === item.label) {
      setLabelDraft(item.label);
      setEditingLabel(false);
      return;
    }
    startTransition(async () => {
      const updated = await updateObjectiveItemAction(item.id, { label: trimmed });
      onChanged(updated);
      setEditingLabel(false);
    });
  }

  function saveNote() {
    if (note === (item.note ?? "")) return;
    startTransition(async () => {
      const updated = await updateObjectiveItemAction(item.id, { note });
      onChanged(updated);
    });
  }

  return (
    <div className="group flex items-start gap-2.5 py-2">
      <button
        type="button"
        onClick={cycleStatus}
        disabled={!canEdit || isPending}
        title={`${STATUS_LABEL[item.status]}${canEdit ? " — bấm để đổi trạng thái" : ""}`}
        className={cn(
          "mt-0.5 flex shrink-0 items-center justify-center",
          canEdit ? "cursor-pointer" : "cursor-default",
        )}
        style={{ color: STATUS_COLOR[item.status] }}
      >
        <StatusIcon size={16} strokeWidth={1.9} />
      </button>

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
          {canEdit && !editingLabel && (
            <span className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
              <button
                type="button"
                onClick={() => {
                  setLabelDraft(item.label);
                  setEditingLabel(true);
                }}
                title="Sửa"
                className="flex size-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover-bg hover:text-ink"
              >
                <Pencil size={12} strokeWidth={1.9} />
              </button>
              <button
                type="button"
                onClick={onRequestDelete}
                title="Xoá mục"
                className="flex size-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 size={12} strokeWidth={1.9} />
              </button>
            </span>
          )}
        </div>

        {canEdit ? (
          <>
            <button
              type="button"
              onClick={() => setNoteModalOpen(true)}
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
                    className="h-9 cursor-pointer rounded-md px-4 text-xs font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "linear-gradient(to right, #20c5d8, #269ce9, #326eea)" }}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </SimpleModal>
          </>
        ) : (
          item.note && <p className="mt-1 text-[12px] text-ink-muted">{item.note}</p>
        )}
      </div>
    </div>
  );
}
