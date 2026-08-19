"use client";

import { useMemo, useState, useTransition } from "react";
import { Book, Plus, Trash2, Wrench } from "lucide-react";
import type { ApiObjective, ApiObjectiveItem, ApiObjectiveItemType } from "@/lib/api/types";
import { ProgressBar } from "@/components/ui/progress-bar";
import { createObjectiveItemAction } from "@/actions/objectives/create-objective-item";
import { deleteObjectiveAction } from "@/actions/objectives/delete-objective";
import { deleteObjectiveItemAction } from "@/actions/objectives/delete-objective-item";
import { ObjectiveItemRow } from "./ObjectiveItemRow";

const SUBSECTIONS: { type: ApiObjectiveItemType; icon: typeof Book; label: string; addLabel: string; placeholder: string }[] = [
  { type: "KNOWLEDGE", icon: Book, label: "Knowledge", addLabel: "Thêm knowledge", placeholder: "VD: Federated access & identity services" },
  { type: "SKILL", icon: Wrench, label: "Skills", addLabel: "Thêm skill", placeholder: "VD: Design role-based access control" },
];

// 1 the "Muc tieu hoc tap" (LearningObjective) trong GroupGoalsSection.tsx -
// header (ten/mo ta/tien do/xoa) + 2 subsection Knowledge/Skills, moi
// subsection tu quan ly rieng trang thai "dang them muc" (khong dung chung 1
// state nhu ArticleChecklist.tsx vi co the co NHIEU the objective cung luc
// tren trang, moi the/subsection can doc lap).
export function ObjectiveCard({
  objective,
  canEdit,
  onChanged,
  onDeleted,
}: {
  objective: ApiObjective;
  canEdit: boolean;
  onChanged: (objective: ApiObjective) => void;
  onDeleted: () => void;
}) {
  const [addingType, setAddingType] = useState<ApiObjectiveItemType | null>(null);
  const [addingLabel, setAddingLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const itemsByType = useMemo(() => {
    const map = new Map<ApiObjectiveItemType, ApiObjectiveItem[]>([
      ["KNOWLEDGE", []],
      ["SKILL", []],
    ]);
    for (const item of objective.items) map.get(item.type)?.push(item);
    return map;
  }, [objective.items]);

  const total = objective.items.length;
  const understood = objective.items.filter((i) => i.status === "UNDERSTOOD").length;
  const percent = total > 0 ? Math.round((understood / total) * 100) : 0;

  function updateItem(updated: ApiObjectiveItem) {
    onChanged({
      ...objective,
      items: objective.items.map((i) => (i.id === updated.id ? updated : i)),
    });
  }

  function removeItem(id: string) {
    if (!window.confirm("Xoá mục này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      await deleteObjectiveItemAction(id);
      onChanged({ ...objective, items: objective.items.filter((i) => i.id !== id) });
    });
  }

  function removeObjective() {
    if (!window.confirm("Xoá mục tiêu học tập này? Không thể hoàn tác.")) return;
    startDelete(async () => {
      await deleteObjectiveAction(objective.id);
      onDeleted();
    });
  }

  function addItem(type: ApiObjectiveItemType) {
    if (isPending) return;
    const label = addingLabel.trim();
    if (!label) {
      setAddingType(null);
      setAddingLabel("");
      return;
    }
    startTransition(async () => {
      const created = await createObjectiveItemAction(objective.id, { type, label });
      onChanged({ ...objective, items: [...objective.items, created] });
      setAddingType(null);
      setAddingLabel("");
    });
  }

  return (
    <div
      className="rounded-[13px] p-4"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>
            {objective.title}
          </h3>
          {objective.description && (
            <p className="mt-0.5 text-[12px]" style={{ color: "var(--ink-faint)" }}>
              {objective.description}
            </p>
          )}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={removeObjective}
            disabled={isDeleting}
            title="Xoá mục tiêu"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={13} strokeWidth={1.9} />
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <ProgressBar percent={percent} className="flex-1" />
          <span className="shrink-0 text-[11px] font-semibold" style={{ color: "var(--ink-muted)" }}>
            {understood}/{total}
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {SUBSECTIONS.map((section) => {
          const items = itemsByType.get(section.type) ?? [];
          return (
            <div key={section.type} className="rounded-[11px] p-2.5" style={{ background: "var(--surface-muted)" }}>
              <span
                className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wide"
                style={{ color: "var(--ink-faint)" }}
              >
                <section.icon size={11} strokeWidth={2} />
                {section.label.toUpperCase()} {items.length > 0 && `${items.length}`}
              </span>

              <div className="flex flex-col divide-y divide-border">
                {items.map((item) => (
                  <ObjectiveItemRow
                    key={item.id}
                    item={item}
                    canEdit={canEdit}
                    onChanged={updateItem}
                    onRequestDelete={() => removeItem(item.id)}
                  />
                ))}
              </div>

              {canEdit &&
                (addingType === section.type ? (
                  <input
                    autoFocus
                    value={addingLabel}
                    onChange={(e) => setAddingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem(section.type);
                      }
                      if (e.key === "Escape") {
                        setAddingType(null);
                        setAddingLabel("");
                      }
                    }}
                    onBlur={() => addItem(section.type)}
                    placeholder={section.placeholder}
                    disabled={isPending}
                    className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingType(section.type);
                      setAddingLabel("");
                    }}
                    className="mt-1 flex cursor-pointer items-center gap-1 text-[11.5px] font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-primary"
                  >
                    <Plus size={11} strokeWidth={2} />
                    {section.addLabel}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
