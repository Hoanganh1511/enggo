"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { Plus, Minus } from "lucide-react";

// 4 ham thao tac hang/cot cua Grid - dung THANG 1 transaction ProseMirror
// (khong qua lenh insertContent/API cao cap) vi can kiem soat CHINH XAC vi
// tri chen/xoa theo tung "hang" (nhom cols phan tu lien tiep - xem comment
// Grid trong post-extensions.ts ve ly do khong dung 1 node "gridRow" rieng).
// MOI o moi luon di kem 1 paragraph rong (KHONG dua vao plugin auto-fix nao -
// xem comment "DA GO BO TrailingNode" trong post-extensions.ts, bug crash
// that da tung xay ra voi huong do).

function addRow(editor: Editor, gridPos: number) {
  editor.commands.command(({ tr, state }) => {
    const gridNode = state.doc.nodeAt(gridPos);
    if (!gridNode || gridNode.type.name !== "grid") return false;
    const cols = gridNode.attrs.cols as number;
    const cellType = state.schema.nodes.gridCell;
    const paragraphType = state.schema.nodes.paragraph;
    if (!cellType || !paragraphType) return false;
    const cells = Array.from({ length: cols }, () =>
      cellType.create({ headColor: null, showStep: false, badge: null }, paragraphType.create()),
    );
    tr.insert(gridPos + gridNode.nodeSize - 1, cells);
    return true;
  });
}

function removeRow(editor: Editor, gridPos: number) {
  editor.commands.command(({ tr, state }) => {
    const gridNode = state.doc.nodeAt(gridPos);
    if (!gridNode) return false;
    const cols = gridNode.attrs.cols as number;
    const totalCells = gridNode.childCount;
    if (totalCells <= cols) return false; // giu it nhat 1 hang
    const offsets: number[] = [];
    let offset = gridPos + 1;
    gridNode.forEach((child) => {
      offsets.push(offset);
      offset += child.nodeSize;
    });
    const from = offsets[totalCells - cols];
    const to = gridPos + gridNode.nodeSize - 1;
    tr.delete(from, to);
    return true;
  });
}

// Them 1 cot - chen 1 o RONG vao CUOI moi hang (dua theo `cols` CU, TRUOC khi
// tang) roi moi cap nhat attrs `cols`. Duyet hang theo thu tu NGUOC (cuoi ve
// dau) khi chen - vi tri cac hang o TRUOC (nho hon) KHONG bi lech boi thao
// tac chen o hang SAU (lon hon) do, nen co the dung THANG vi tri tinh tu
// state.doc GOC ma khong can tinh lai sau moi lan chen.
function addColumn(editor: Editor, gridPos: number) {
  editor.commands.command(({ tr, state }) => {
    const gridNode = state.doc.nodeAt(gridPos);
    if (!gridNode) return false;
    const cols = gridNode.attrs.cols as number;
    const cellType = state.schema.nodes.gridCell;
    const paragraphType = state.schema.nodes.paragraph;
    if (!cellType || !paragraphType) return false;
    const offsets: number[] = [];
    let offset = gridPos + 1;
    gridNode.forEach((child) => {
      offsets.push(offset);
      offset += child.nodeSize;
    });
    const rowCount = Math.ceil(offsets.length / cols);
    for (let r = rowCount - 1; r >= 0; r--) {
      const lastIndexInRow = Math.min((r + 1) * cols, offsets.length) - 1;
      const insertAt = offsets[lastIndexInRow] + gridNode.child(lastIndexInRow).nodeSize;
      tr.insert(insertAt, cellType.create({ headColor: null, showStep: false, badge: null }, paragraphType.create()));
    }
    tr.setNodeMarkup(gridPos, undefined, { ...gridNode.attrs, cols: cols + 1 });
    return true;
  });
}

function removeColumn(editor: Editor, gridPos: number) {
  editor.commands.command(({ tr, state }) => {
    const gridNode = state.doc.nodeAt(gridPos);
    if (!gridNode) return false;
    const cols = gridNode.attrs.cols as number;
    if (cols <= 1) return false; // giu it nhat 1 cot
    const offsets: number[] = [];
    let offset = gridPos + 1;
    gridNode.forEach((child) => {
      offsets.push(offset);
      offset += child.nodeSize;
    });
    const rowCount = Math.ceil(offsets.length / cols);
    for (let r = rowCount - 1; r >= 0; r--) {
      const lastIndexInRow = Math.min((r + 1) * cols, offsets.length) - 1;
      const from = offsets[lastIndexInRow];
      const to = from + gridNode.child(lastIndexInRow).nodeSize;
      tr.delete(from, to);
    }
    tr.setNodeMarkup(gridPos, undefined, { ...gridNode.attrs, cols: cols - 1 });
    return true;
  });
}

function StepperBtn({ label, onClick, Icon }: { label: string; onClick: () => void; Icon: typeof Plus }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover-bg hover:text-ink"
    >
      <Icon size={11} strokeWidth={2.4} />
    </button>
  );
}

// NodeView cua Grid - thanh dieu khien hang/cot (contentEditable=false) +
// vung o that (NodeViewContent, CSS grid tu xep theo `cols`).
export function GridView({ node, editor, getPos }: ReactNodeViewProps) {
  const cols = node.attrs.cols as number;
  const canEdit = editor.isEditable;
  // getPos() ve mat KIEU co the tra undefined (node tam thoi khong nam
  // trong doc, vd dang bi xoa) - cac ham addRow/removeRow/addColumn/
  // removeColumn deu can 1 vi tri THAT, bo qua an toan neu khong co.
  const withPos = (fn: (editor: Editor, pos: number) => void) => () => {
    const pos = getPos();
    if (pos !== undefined) fn(editor, pos);
  };

  return (
    <NodeViewWrapper className="grid-block my-4">
      {canEdit && (
        <div contentEditable={false} className="mb-2 flex items-center gap-3 text-[11px] font-medium text-ink-faint">
          <span className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1">
            Hàng
            <StepperBtn label="Thêm hàng" Icon={Plus} onClick={withPos(addRow)} />
            <StepperBtn label="Bớt hàng" Icon={Minus} onClick={withPos(removeRow)} />
          </span>
          <span className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1">
            Cột
            <StepperBtn label="Thêm cột" Icon={Plus} onClick={withPos(addColumn)} />
            <StepperBtn label="Bớt cột" Icon={Minus} onClick={withPos(removeColumn)} />
          </span>
        </div>
      )}
      {/* [2026-09-19 fix] display/gap dat THANG qua inline style (khong con
          chi dua vao Tailwind class "[&_.grid-cells]:grid") - bug nguoi dung
          bao "Lỗi grid à?" kem anh chup: cac o xep DOC 1-cot-1-hang thay vi
          dan ngang theo dung `cols`, moi hang chiem 1 khoang hep + con lai
          trong het ve phia phai - dau hieu display:grid KHONG duoc ap dung
          (rot ve display mac dinh cua <div>, tung o TU CO LAI theo noi dung
          thay vi dan theo track luoi). Inline style co do UU TIEN CAO NHAT
          (chi thua !important) nen CHAC CHAN thang the moi xung dot/thu tu
          nap CSS ngoai y muon, khong con phu thuoc lieu class Tailwind [&_...]
          co duoc ap dung dung hay khong. */}
      <NodeViewContent
        className="grid-cells"
        style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      />
    </NodeViewWrapper>
  );
}
