"use client";

import { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { List, ListOrdered, Pilcrow, Plus, Settings2, Trash2, X } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { newGlossaryParagraph, newGlossaryList, type GlossaryBlock } from "./glossary-hint-extension";

// Tach rieng khoi glossary-hint-extension.tsx (chi con GlossaryHint = Tiptap
// Node object thuan) - component React dung hook nay PHAI "use client", nhung
// Node.create({...}) thi KHONG (can doc duoc tu Server Component luc build
// schema tinh cho ArticleBody.tsx). Gop chung 1 file truoc day khien
// GlossaryHint bi Next.js RSC thay bang 1 "client reference" gia moi khi
// import tu Server Component, lam getSchema() crash vi thieu .config (xem
// docs/engineering-log.md 2026-09-10).
function BlockFields({
  block,
  onChange,
  onRemove,
}: {
  block: GlossaryBlock;
  onChange: (next: GlossaryBlock) => void;
  onRemove: () => void;
}) {
  const Icon = block.type === "paragraph" ? Pilcrow : block.type === "bulletList" ? List : ListOrdered;
  const label = block.type === "paragraph" ? "Đoạn văn" : block.type === "bulletList" ? "Danh sách chấm" : "Danh sách số";

  return (
    <div className="rounded-md border border-border p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10.5px] font-medium tracking-wide text-ink-faint uppercase">
          <Icon size={11} strokeWidth={2} aria-hidden="true" />
          {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Xoá khối"
          className="flex size-5 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover-bg hover:text-danger"
        >
          <X size={12} strokeWidth={2} />
        </button>
      </div>
      {block.type === "paragraph" ? (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ type: "paragraph", text: e.target.value })}
          placeholder="Nội dung..."
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary/50"
        />
      ) : (
        <textarea
          // Moi DONG la 1 muc danh sach - don gian hoa nhap lieu (khong can
          // repeater rieng tung dong) - yeu cau nguoi dung chi can "list
          // dots, list number", khong can dinh dang rieng ben trong tung muc.
          value={block.items.join("\n")}
          onChange={(e) => onChange({ type: block.type, items: e.target.value.split("\n") })}
          placeholder={"Mỗi dòng 1 mục..."}
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary/50"
        />
      )}
    </div>
  );
}

export function GlossaryHintView({ node, updateAttributes, deleteNode, editor }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const [open, setOpen] = useState(false);
  const explanation = (node.attrs.explanation as GlossaryBlock[]) ?? [];

  function updateBlock(index: number, next: GlossaryBlock) {
    updateAttributes({ explanation: explanation.map((b, i) => (i === index ? next : b)) });
  }
  function removeBlock(index: number) {
    updateAttributes({ explanation: explanation.filter((_, i) => i !== index) });
  }
  function addBlock(block: GlossaryBlock) {
    updateAttributes({ explanation: [...explanation, block] });
  }

  return (
    <NodeViewWrapper as="span" style={{ display: "inline" }}>
      {/* NodeViewContent mac dinh render "div" (khong dung "as" - thu generic
          "span" bi TS tu suy luan nham ve "div", xem thu nghiem that bai luc
          lam). `.glossary-term` tu ep display:inline qua CSS (globals.css)
          de khong vi pham luong inline cua doan van cha - trinh duyet van
          hien dung, chi khac ve ngu nghia the <div> lam con <span>. */}
      <NodeViewContent className="glossary-term" />
      {canEdit && (
        <span className="glossary-term-edit-trigger" contentEditable={false}>
          <PopoverRoot open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Sửa chú thích"
                className="inline-flex size-4 shrink-0 -translate-y-px cursor-pointer items-center justify-center rounded-full text-ink-faint align-middle transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-primary"
              >
                <Settings2 size={10} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent open={open} align="start" className="z-50 w-80 rounded-lg border border-border bg-surface p-3 shadow-dropdown">
              <div className="flex flex-col gap-2">
                {explanation.length === 0 && (
                  <p className="text-[11.5px] text-ink-faint">Chưa có nội dung giải thích - thêm 1 khối bên dưới.</p>
                )}
                {explanation.map((block, i) => (
                  <BlockFields
                    key={i}
                    block={block}
                    onChange={(next) => updateBlock(i, next)}
                    onRemove={() => removeBlock(i)}
                  />
                ))}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addBlock(newGlossaryParagraph())}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-primary hover:bg-primary-soft"
                  >
                    <Plus size={11} /> Đoạn văn
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock(newGlossaryList("bulletList"))}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-primary hover:bg-primary-soft"
                  >
                    <Plus size={11} /> List chấm
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock(newGlossaryList("orderedList"))}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-primary hover:bg-primary-soft"
                  >
                    <Plus size={11} /> List số
                  </button>
                </div>
                <div className="flex justify-end border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={deleteNode}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={11} /> Xoá chú thích
                  </button>
                </div>
              </div>
            </PopoverContent>
          </PopoverRoot>
        </span>
      )}
    </NodeViewWrapper>
  );
}
