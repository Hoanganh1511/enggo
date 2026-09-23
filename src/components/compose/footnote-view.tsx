"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Tach rieng khoi footnote-extension.tsx (xem comment tuong tu dau
// glossary-hint-view.tsx ve ly do "use client" phai o file KHAC voi
// Node.create()). So thu tu ("[1]", "[2]"...) la CSS COUNTER thuan (xem
// class "footnote-ref" trong POST_PROSE_CLASS) - CHINH element nay (button)
// mang class do de counter hien TRUC TIEP tren be mat co the bam, khong
// tach roi giua "so hien thi" va "vung bam duoc".
export function FootnoteView({ node, updateAttributes, deleteNode, editor }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const content = ((node.attrs.content as string) ?? "").trim();
  const canEdit = editor.isEditable;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(content);
      setEditing(!content && canEdit);
    }
  }

  function save() {
    updateAttributes({ content: draft.trim() });
    setEditing(false);
    if (!draft.trim()) setOpen(false);
  }

  return (
    <NodeViewWrapper as="span" contentEditable={false} style={{ display: "inline" }}>
      <PopoverRoot open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={content || "Thêm chú thích cuối trang"}
            className="footnote-ref cursor-pointer border-none bg-transparent p-0 align-super text-primary hover:underline"
          />
        </PopoverTrigger>
        <PopoverContent
          open={open}
          align="start"
          className="z-50 w-80 rounded-lg p-3"
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
                placeholder="Nội dung chú thích cuối trang..."
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
                      if (!content) deleteNode();
                      else {
                        setDraft(content);
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
              <p className="text-xs leading-relaxed text-ink-muted">{content || "Chưa có nội dung."}</p>
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
                    Sửa nội dung
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
