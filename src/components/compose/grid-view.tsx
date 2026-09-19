"use client";

import { useLayoutEffect, useRef } from "react";
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { Plus, Minus } from "lucide-react";
import { BlockActionsMenu } from "./BlockActionsMenu";

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
      cellType.create({ headColor: null, showStep: false }, paragraphType.create()),
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
      tr.insert(insertAt, cellType.create({ headColor: null, showStep: false }, paragraphType.create()));
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

  // [2026-09-19 fix #3] Sau 2 lan fix (dat inline style THANG len
  // <NodeViewContent>, roi doi qua bien CSS `--grid-cols` ke thua) VAN chua
  // chac chan - ca 2 deu dua vao viec Tiptap/CSS ke thua/Tailwind arbitrary
  // property hoat dong dung y tren MOI trinh duyet. Lan nay dung THANG DOM
  // API (khong qua CSS/Tailwind nua) de loai het rui ro: <NodeViewContent>
  // (voi 1 node KHONG phai atom nhu Grid) chi la 1 lop VO NGOAI - contentDOM
  // THAT (noi cac GridCell con thuc su nam) la 1 <div data-node-view-content-react>
  // Tiptap TU TAO RIENG va chen VAO BEN TRONG lop vo do (xem chi tiet trong
  // node_modules/@tiptap/react). wrapperRef tro toi 1 <div> THUONG bao NGOAI
  // <NodeViewContent> - moi lan `cols` doi, tu tim dung phan tu con that
  // (querySelector) va GAN THANG style qua DOM API, chac chan 100% khong
  // phu thuoc CSS/Tailwind nao ca.
  // useLayoutEffect (khong phai useEffect) + KHONG gioi han dependency array
  // (chay lai sau MOI lan render, khong chi khi `cols` doi) - Tiptap tu tao
  // contentDOMElement o thoi diem hoi khac nhau tuy tinh huong (lan dau mount
  // co the CHUA kip gan vao luc effect nay chay lan dau), nen chay lai tren
  // MOI render (component nay von da re-render lien tuc do
  // shouldRerenderOnTransaction:true o SeriesEntryEditor.tsx, nen chi phi
  // them 1 querySelector + gan 3 style moi lan la khong dang ke) dam bao
  // BAT KY luc nao phan tu that xuat hien deu duoc gan dung style ngay.
  const wrapperRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const inner = wrapperRef.current?.querySelector<HTMLElement>("[data-node-view-content-react]");
    if (!inner) return;
    inner.style.display = "grid";
    inner.style.gap = "0.75rem";
    inner.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  });

  return (
    <NodeViewWrapper className="grid-block group relative my-4">
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
          <BlockActionsMenu editor={editor} getPos={getPos} node={node} className="ml-auto" />
        </div>
      )}
      <div ref={wrapperRef}>
        <NodeViewContent className="grid-cells" />
      </div>
    </NodeViewWrapper>
  );
}
