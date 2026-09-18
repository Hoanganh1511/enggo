"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ArrowDown, Plus, X } from "lucide-react";
import type { FlowDiagramStep } from "./post-extensions";

// NodeView cua "Sơ đồ luồng" (FlowDiagram) - CHI phuc vu luc SOAN (giong
// tinh than QuestionPickerView/StatAccordionView: du lieu la snapshot attrs
// JSON, ban render TINH luc doc dung <div>/CSS thuan, xem post-extensions.ts).
// Moi buoc = 1 o nhap tieu de + (tru buoc cuoi) 1 o nhap "note" gan cho mui
// ten roi toi buoc KE TIEP - dung y "One geographic area is not enough for
// resilience." trong vi du nguoi dung gui (mo ta gan tren mui ten, khong
// phai gan tren chinh buoc).
export function FlowDiagramView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const steps = (node.attrs.steps ?? []) as FlowDiagramStep[];
  const canEdit = editor.isEditable;

  function updateStep(index: number, patch: Partial<FlowDiagramStep>) {
    updateAttributes({ steps: steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  }
  function addStep() {
    updateAttributes({ steps: [...steps, { title: "" }] });
  }
  function removeStep(index: number) {
    updateAttributes({ steps: steps.filter((_, i) => i !== index) });
  }

  return (
    <NodeViewWrapper contentEditable={false} className="flow-diagram-view my-4 flex flex-col items-center gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex w-full max-w-sm flex-col items-center">
            <div className="group relative flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              {canEdit ? (
                <input
                  value={step.title}
                  onChange={(e) => updateStep(i, { title: e.target.value })}
                  placeholder={`Bước ${i + 1}...`}
                  className="min-w-0 flex-1 bg-transparent text-center text-[13.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
                />
              ) : (
                <span className="min-w-0 flex-1 text-center text-[13.5px] font-semibold text-ink">
                  {step.title}
                </span>
              )}
              {canEdit && steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  aria-label="Bỏ bước"
                  className="absolute -top-2 -right-2 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
                >
                  <X size={11} strokeWidth={2} />
                </button>
              )}
            </div>

            {!isLast && (
              <div className="flex w-full items-start gap-2 py-1.5">
                <div className="flex w-full max-w-sm flex-1 flex-col items-center">
                  <ArrowDown size={16} strokeWidth={2} className="text-ink-faint" aria-hidden="true" />
                </div>
              </div>
            )}
            {!isLast &&
              (canEdit ? (
                <input
                  value={step.note ?? ""}
                  onChange={(e) => updateStep(i, { note: e.target.value || undefined })}
                  placeholder="Vì sao cần bước tiếp theo? (không bắt buộc)"
                  className="-mt-1 mb-1.5 w-full max-w-xs rounded-md border border-border bg-surface-muted px-2 py-1 text-center text-[12px] text-ink-muted outline-none placeholder:text-ink-faint"
                />
              ) : (
                step.note && (
                  <p className="-mt-1 mb-1.5 max-w-xs text-center text-[12px] text-ink-faint italic">{step.note}</p>
                )
              ))}
          </div>
        );
      })}
      {canEdit && (
        <button
          type="button"
          onClick={addStep}
          className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
        >
          <Plus size={13} strokeWidth={2} />
          Thêm bước
        </button>
      )}
    </NodeViewWrapper>
  );
}
