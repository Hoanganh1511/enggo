"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ArrowDown, Plus, Split, X } from "lucide-react";
import type { FlowDiagramStep } from "./post-extensions";

// [2026-09-18] Doi tu danh sach phang sang CAY (re nhanh duoc) - yeu cau
// nguoi dung: "muốn rẽ nhánh thì làm sao?" (vd AWS Region -> AZ-A/AZ-B/AZ-C).
// 3 ham duoi day thao tac BAT BIEN (immutable) tren cay dua theo `path` (mang
// chi so con, vd [0,1] = "con thu 2 cua con thu 1 cua root") - moi thao tac
// deu tra ve 1 CAY MOI hoan toan, roi goi updateAttributes({ root }) 1 LAN
// duy nhat o component goc (node nay la ATOM, khong co ProseMirror children
// that, nen KHONG the "cap nhat 1 phan" - phai thay THE CA CAY moi lan sua).
function updateNodeAtPath(root: FlowDiagramStep, path: number[], patch: Partial<FlowDiagramStep>): FlowDiagramStep {
  if (path.length === 0) return { ...root, ...patch };
  const [head, ...rest] = path;
  const children = root.children ?? [];
  return { ...root, children: children.map((c, i) => (i === head ? updateNodeAtPath(c, rest, patch) : c)) };
}

function addChildAtPath(root: FlowDiagramStep, path: number[]): FlowDiagramStep {
  if (path.length === 0) return { ...root, children: [...(root.children ?? []), { title: "" }] };
  const [head, ...rest] = path;
  const children = root.children ?? [];
  return { ...root, children: children.map((c, i) => (i === head ? addChildAtPath(c, rest) : c)) };
}

// Xoa 1 nut (va toan bo cay con cua no) - `path` phai co it nhat 1 phan tu,
// khong the xoa root.
function removeNodeAtPath(root: FlowDiagramStep, path: number[]): FlowDiagramStep {
  if (path.length === 1) {
    const children = (root.children ?? []).filter((_, i) => i !== path[0]);
    return { ...root, children: children.length > 0 ? children : undefined };
  }
  const [head, ...rest] = path;
  const children = root.children ?? [];
  return { ...root, children: children.map((c, i) => (i === head ? removeNodeAtPath(c, rest) : c)) };
}

// 1 "nut" trong cay - de quy render chinh no + toan bo nhanh con. `isRoot`
// chi anh huong placeholder/an nut xoa (khong the xoa buoc dau tien).
function FlowNodeEditor({
  node,
  path,
  isRoot,
  canEdit,
  onUpdate,
  onAddChild,
  onAddBranch,
  onRemove,
}: {
  node: FlowDiagramStep;
  path: number[];
  isRoot: boolean;
  canEdit: boolean;
  onUpdate: (path: number[], patch: Partial<FlowDiagramStep>) => void;
  onAddChild: (path: number[]) => void;
  onAddBranch: (path: number[]) => void;
  onRemove: (path: number[]) => void;
}) {
  const children = node.children ?? [];

  return (
    <div className="flex w-full flex-col items-center">
      <div className="group relative flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        {canEdit ? (
          <input
            value={node.title}
            onChange={(e) => onUpdate(path, { title: e.target.value })}
            placeholder={isRoot ? "Bước đầu tiên..." : `Bước ${path[path.length - 1] + 1}...`}
            className="min-w-0 flex-1 bg-transparent text-center text-[13.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
          />
        ) : (
          <span className="min-w-0 flex-1 text-center text-[13.5px] font-semibold text-ink">{node.title}</span>
        )}
        {canEdit && !isRoot && (
          <button
            type="button"
            onClick={() => onRemove(path)}
            aria-label="Bỏ nhánh này"
            className="absolute -top-2 -right-2 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
          >
            <X size={11} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 1 nhanh duy nhat - y HET truoc day: 1 mui ten thang, co the kem 1 o
          nhap "note" giai thich vi sao can buoc tiep theo. */}
      {children.length === 1 && (
        <>
          <div className="flex w-full max-w-sm flex-col items-center py-1.5">
            <ArrowDown size={16} strokeWidth={2} className="text-ink-faint" aria-hidden="true" />
          </div>
          {canEdit ? (
            <input
              value={children[0].note ?? ""}
              onChange={(e) => onUpdate([...path, 0], { note: e.target.value || undefined })}
              placeholder="Vì sao cần bước tiếp theo? (không bắt buộc)"
              className="-mt-1 mb-1.5 w-full max-w-xs rounded-md border border-border bg-surface-muted px-2 py-1 text-center text-[12px] text-ink-muted outline-none placeholder:text-ink-faint"
            />
          ) : (
            children[0].note && (
              <p className="-mt-1 mb-1.5 max-w-xs text-center text-[12px] text-ink-faint italic">{children[0].note}</p>
            )
          )}
          <FlowNodeEditor
            node={children[0]}
            path={[...path, 0]}
            isRoot={false}
            canEdit={canEdit}
            onUpdate={onUpdate}
            onAddChild={onAddChild}
            onAddBranch={onAddBranch}
            onRemove={onRemove}
          />
        </>
      )}

      {/* NHIEU nhanh - xep hang ngang, moi cot 1 nhanh doc lap (dung y AWS
          Region -> AZ-A/AZ-B/AZ-C nguoi dung mo ta). */}
      {children.length > 1 && (
        <div className="mt-2 flex w-full flex-wrap items-start justify-center gap-4 border-t border-dashed border-border pt-3">
          {children.map((child, i) => (
            <div key={i} className="flex min-w-40 flex-1 flex-col items-center">
              <div className="mb-1.5 flex items-center gap-1 text-[10.5px] font-semibold tracking-wide text-ink-faint uppercase">
                <Split size={10} strokeWidth={2} />
                Nhánh {i + 1}
              </div>
              {canEdit ? (
                <input
                  value={child.note ?? ""}
                  onChange={(e) => onUpdate([...path, i], { note: e.target.value || undefined })}
                  placeholder="Vì sao rẽ nhánh này? (không bắt buộc)"
                  className="mb-1.5 w-full max-w-xs rounded-md border border-border bg-surface-muted px-2 py-1 text-center text-[12px] text-ink-muted outline-none placeholder:text-ink-faint"
                />
              ) : (
                child.note && (
                  <p className="mb-1.5 max-w-xs text-center text-[12px] text-ink-faint italic">{child.note}</p>
                )
              )}
              <FlowNodeEditor
                node={child}
                path={[...path, i]}
                isRoot={false}
                canEdit={canEdit}
                onUpdate={onUpdate}
                onAddChild={onAddChild}
                onAddBranch={onAddBranch}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-2 flex items-center gap-3">
          {children.length === 0 && (
            <button
              type="button"
              onClick={() => onAddChild(path)}
              className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
            >
              <Plus size={13} strokeWidth={2} />
              Thêm bước tiếp theo
            </button>
          )}
          <button
            type="button"
            onClick={() => onAddBranch(path)}
            title="Thêm 1 nhánh mới rẽ ra từ bước này"
            className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
          >
            <Split size={13} strokeWidth={2} />
            Thêm nhánh
          </button>
        </div>
      )}
    </div>
  );
}

// NodeView cua "Sơ đồ luồng" (FlowDiagram) - CHI phuc vu luc SOAN (giong
// tinh than QuestionPickerView/StatAccordionView: du lieu la snapshot attrs
// JSON, ban render TINH luc doc dung <div>/CSS thuan, xem post-extensions.ts).
// Du lieu la 1 CAY (`root: FlowDiagramStep`, xem post-extensions.ts) thay vi
// mang phang truoc day - cho phep re nhanh (1 buoc co NHIEU buoc ke tiep).
export function FlowDiagramView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const root = (node.attrs.root ?? { title: "" }) as FlowDiagramStep;
  const canEdit = editor.isEditable;

  function handleUpdate(path: number[], patch: Partial<FlowDiagramStep>) {
    updateAttributes({ root: updateNodeAtPath(root, path, patch) });
  }
  function handleAddChild(path: number[]) {
    updateAttributes({ root: addChildAtPath(root, path) });
  }
  function handleRemove(path: number[]) {
    updateAttributes({ root: removeNodeAtPath(root, path) });
  }

  return (
    <NodeViewWrapper contentEditable={false} className="flow-diagram-view my-4 flex flex-col items-center gap-0">
      <FlowNodeEditor
        node={root}
        path={[]}
        isRoot
        canEdit={canEdit}
        onUpdate={handleUpdate}
        onAddChild={handleAddChild}
        onAddBranch={handleAddChild}
        onRemove={handleRemove}
      />
    </NodeViewWrapper>
  );
}
