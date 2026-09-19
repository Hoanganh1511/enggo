"use client";

import { useLayoutEffect, useRef } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { BlockActionsMenu } from "./BlockActionsMenu";
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

  // [2026-09-19] Giu nguyen vi tri con tro qua moi lan go - yeu cau nguoi
  // dung: "cứ bị lỗi nhảy ra sau nút đóng ngoặc" (go giua chung, vd sau
  // "(5G)", cu bi day/nhay ve 1 vi tri co dinh). Nguyen nhan: MOI ky tu go
  // vao deu di qua 1 vong tron ProseMirror THAT (onUpdate -> updateAttributes
  // -> transaction -> NodeView nay nhan `node` MOI) truoc khi quay lai render
  // React - trong khi node ATOM nay nam LONG trong cay de quy (nhieu cap
  // FlowNodeEditor long nhau qua children.map), 1 vai trinh duyet/React se
  // TAO LAI (khong tai su dung y het) phan tu <textarea> DOM o cac cap sau
  // moi lan cay React duoc dung lai tu goc NodeView, lam mat vi tri con tro
  // dang go (mac dinh nhay ve 1 vi tri co dinh thay vi giu dung cho). Luu
  // lai selectionStart NGAY LUC go (truoc khi update lan truyen qua
  // ProseMirror) roi chu dong dat lai o useLayoutEffect (chay NGAY SAU khi
  // DOM cap nhat xong, truoc khi trinh duyet ve len man hinh) - an toan du
  // DOM co bi thay the hay khong.
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const caretPos = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caretPos.current === null || !titleRef.current) return;
    titleRef.current.setSelectionRange(caretPos.current, caretPos.current);
    caretPos.current = null;
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="group relative flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        {canEdit ? (
          <textarea
            ref={titleRef}
            value={node.title}
            onChange={(e) => {
              caretPos.current = e.target.selectionStart;
              onUpdate(path, { title: e.target.value });
            }}
            placeholder={isRoot ? "Bước đầu tiên..." : `Bước ${path[path.length - 1] + 1}...`}
            rows={Math.max(1, node.title.split("\n").length)}
            className="min-w-0 flex-1 resize-none bg-transparent text-center text-[13.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
          />
        ) : (
          <span className="min-w-0 flex-1 text-center text-[13.5px] font-semibold whitespace-pre-line text-ink">
            {node.title}
          </span>
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

      {/* [2026-09-18 fix] Nut dieu khien cua CHINH buoc nay - PHAI dat NGAY O
          DAY (truoc khi de quy xuong con), khong dat SAU nhu ban dau - bug
          nguoi dung bao "Thêm nhánh bị lỗi": ban dau nut nay nam SAU toan bo
          khoi de quy children, nen voi 1 chuoi dai, TAT CA nut cua MOI cap
          (root, con, chau...) bi don xuong DUOI CUNG dung sat nhau, trong khi
          THUC RA moi nut thuoc VE 1 cap KHAC NHAU trong cay - bam lien tiep
          tuong dang bam 1 nut duy nhat nhung thuc ra moi lan roi vao 1 buoc
          khac (luon la chuoi thang, khong ra nhanh that). Dat o day = luon
          hien NGAY DUOI dung buoc cua no, ro rang khong nham lan - dong thoi
          giai quyet luon y "phải cho rẽ nhánh ngay sau bước đầu chứ": ROOT
          gio cung co nut rieng cua no o day, khong con phai xuong den la moi
          co. Buoc CHUA co con (0) -> chi "Thêm bước tiếp theo" (rẽ nhánh vo
          nghia khi chua co gi de re THEM). Buoc DA co >=1 con -> "Thêm nhánh"
          (bam se them 1 con NUA, tu dong chuyen sang giao dien re nhanh
          ngang khi dat 2 con tro len). */}
      {canEdit && (
        <div className="mt-2 flex items-center gap-3">
          {children.length === 0 ? (
            <button
              type="button"
              onClick={() => onAddChild(path)}
              className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
            >
              <Plus size={13} strokeWidth={2} />
              Thêm bước tiếp theo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAddBranch(path)}
              title="Thêm 1 nhánh mới rẽ ra từ bước này"
              className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
            >
              <Split size={13} strokeWidth={2} />
              Thêm nhánh
            </button>
          )}
        </div>
      )}

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

      {/* NHIEU nhanh - LUON xep hang ngang (yeu cau nguoi dung: "Rẽ nhánh
          nhưng không theo chiều ngang... nhánh 1 nhánh 2 phải hàng ngang") -
          BUG that su truoc do: flex-wrap cho phep cac nhanh TU RONG XUONG
          dong ke tiep khi cot form (SeriesEntryForm.tsx) khong du rong cho
          ca 2 nhanh (moi nhanh min-w-40 = 160px + gap), nhin nhu bi xep DOC
          thay vi ngang. flex-nowrap + overflow-x-auto: giu CHAC 1 hang
          ngang duy nhat, cho cuon ngang khi khong du cho thay vi tu xuong
          dong. shrink-0 tren tung nhanh (thay flex-1) - flex-1 truoc do se
          TU CO LAI be rong khi flex-nowrap khien tong be rong vuot khung,
          lam mat y nghia min-w-40 (nhanh bi bop qua hep, chu de xuong dong
          lung tung) - shrink-0 giu DUNG be rong toi thieu, day trach nhiem
          "khong du cho" sang thanh cuon ngang cua the cha thay vi bop noi
          dung con. */}
      {children.length > 1 && (
        <div className="mt-2 flex w-full flex-nowrap items-start justify-center gap-4 overflow-x-auto border-t border-dashed border-border pt-3">
          {children.map((child, i) => (
            <div key={i} className="flex min-w-40 shrink-0 flex-col items-center">
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
    </div>
  );
}

// NodeView cua "Sơ đồ luồng" (FlowDiagram) - CHI phuc vu luc SOAN (giong
// tinh than QuestionPickerView/StatAccordionView: du lieu la snapshot attrs
// JSON, ban render TINH luc doc dung <div>/CSS thuan, xem post-extensions.ts).
// Du lieu la 1 CAY (`root: FlowDiagramStep`, xem post-extensions.ts) thay vi
// mang phang truoc day - cho phep re nhanh (1 buoc co NHIEU buoc ke tiep).
export function FlowDiagramView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
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
    <NodeViewWrapper contentEditable={false} className="flow-diagram-view group my-4 flex w-full flex-col items-center gap-0">
      {canEdit && (
        <div className="mb-1.5 flex w-full justify-end">
          <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
        </div>
      )}
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
