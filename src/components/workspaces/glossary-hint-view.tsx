"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { CircleHelp, Trash2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Tach rieng khoi glossary-hint-extension.tsx (chi con GlossaryHint = Tiptap
// Node object thuan) - component React dung hook nay PHAI "use client", nhung
// Node.create({...}) thi KHONG (can doc duoc tu Server Component luc build
// schema tinh cho ArticleBody.tsx). Gop chung 1 file truoc day khien
// GlossaryHint bi Next.js RSC thay bang 1 "client reference" gia moi khi
// import tu Server Component, lam getSchema() crash vi thieu .config (xem
// docs/engineering-log.md 2026-09-10).
export function GlossaryHintView({ node, updateAttributes, deleteNode, editor }: ReactNodeViewProps) {
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
