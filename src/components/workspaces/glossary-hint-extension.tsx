"use client";

import { useState } from "react";
import {
  Node,
  mergeAttributes,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { CircleHelp, Trash2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Node inline "chu thich thuat ngu" - 1 icon dau hoi nho DUNG NGAY SAU 1 cum
// tu (khong phai mark boc quanh cum tu - cum tu giu nguyen, chi them 1 node
// rieng ke ben, xem toolbar "them chu thich" trong PostEditorToolbar.tsx).
// Click icon mo popover: doc thuong thi CHI xem noi dung giai thich (khong
// sua duoc); editor.isEditable=true (dang soan) thi co them nut sua/xoa. La
// atom node (khong co noi dung con), NodeView React dung CHUNG 1 component
// cho CA che do soan (PostEditor) lan che do doc (ArticleReaderPane/PostView
// deu dung useEditor({editable:false}) THAT, khong phai generateHTML tinh -
// nen NodeView React nay hoat dong dung y het o ca 2 noi, khong can lam
// rieng 1 ban "read-only" tinh bang HTML).
export const GlossaryHint = Node.create({
  name: "glossaryHint",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      explanation: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-explanation") ?? "",
        renderHTML: (attrs) => ({ "data-explanation": (attrs.explanation as string) ?? "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-glossary-hint]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-glossary-hint": "" }), "?"];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GlossaryHintView);
  },
});

function GlossaryHintView({ node, updateAttributes, deleteNode, editor }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const explanation = ((node.attrs.explanation as string) ?? "").trim();
  const canEdit = editor.isEditable;

  // Moi lan MO popover: neu chua co noi dung va dang o che do soan, vao
  // thang man sua (thay vi bat nguoi dung mo popover roi bam them 1 lan
  // "Sửa" cho 1 chu thich vua tao con rong) - xem toolbar insert ben duoi.
  // Xu ly trong onOpenChange (event handler THAT su, khong phai effect) -
  // khong con can useEffect rieng chi de dong bo 2 state theo `open`.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(explanation);
      setEditing(!explanation && canEdit);
    }
  }

  function save() {
    updateAttributes({ explanation: draft.trim() });
    setEditing(false);
    if (!draft.trim()) setOpen(false);
  }

  return (
    <NodeViewWrapper as="span" contentEditable={false} style={{ display: "inline" }}>
      <PopoverRoot open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={explanation || "Thêm chú thích"}
            className="mx-0.5 inline-flex size-[15px] shrink-0 -translate-y-px cursor-pointer items-center justify-center rounded-full align-middle transition-colors duration-150 ease-out"
            style={{
              background: "color-mix(in srgb, var(--primary) 15%, transparent)",
              color: "var(--primary)",
            }}
          >
            <CircleHelp size={11} strokeWidth={2.4} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={open}
          align="start"
          className="z-50 w-72 rounded-lg p-3"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-dropdown)",
          }}
        >
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Giải thích ngắn gọn cụm từ này..."
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-ink outline-none focus:border-primary/50"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={deleteNode}
                  title="Xoá chú thích"
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-danger"
                >
                  <Trash2 size={12} strokeWidth={2} />
                </button>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!explanation) deleteNode();
                      else {
                        setDraft(explanation);
                        setEditing(false);
                      }
                    }}
                    className="h-7 cursor-pointer rounded-md px-2.5 text-[11px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="h-7 cursor-pointer rounded-md bg-community-accent px-2.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs leading-relaxed text-ink-muted">
                {explanation || "Chưa có nội dung giải thích."}
              </p>
              {canEdit && (
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={deleteNode}
                    title="Xoá chú thích"
                    className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-danger"
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="h-7 cursor-pointer rounded-md px-2.5 text-[11px] font-medium text-primary transition-colors duration-150 ease-out hover:bg-hover-bg"
                  >
                    Sửa giải thích
                  </button>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </PopoverRoot>
    </NodeViewWrapper>
  );
}
