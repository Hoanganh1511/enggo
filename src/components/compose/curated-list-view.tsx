"use client";

import { useState } from "react";
import Image from "next/image";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ArrowRight, Plus, X } from "lucide-react";
import { CuratedItemPickerModal } from "./CuratedItemPickerModal";
import type { CuratedListItem } from "./post-extensions";
import { cn } from "@/lib/utils";
import { BlockActionsMenu } from "./BlockActionsMenu";

// NodeView cua khoi "Đọc thêm" (4 the ngang) - CHI chay khi mount trong 1
// Editor THAT (soan hoac 1 mat doc "song" nao do dung useEditor), KHONG chay
// trong duong render tinh renderTiptapHTML()/generateHTML() - xem
// post-extensions.ts). editable=false (doc) thi moi the la 1 link that toi
// bai, khong con nut "+"/"x" - editable=true (soan) moi mo modal chon bai.
export function CuratedListView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const items = (node.attrs.items ?? []) as (CuratedListItem | null)[];
  const canEdit = editor.isEditable;

  function setItem(index: number, item: CuratedListItem) {
    const next = [...items];
    next[index] = item;
    updateAttributes({ items: next });
  }

  function removeItem(index: number) {
    const next = [...items];
    next[index] = null;
    updateAttributes({ items: next });
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4 flex flex-col gap-2.5">
      {canEdit && (
        <div className="flex justify-end">
          <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
        </div>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl border p-3",
            item ? "border-border bg-surface" : "border-dashed border-border bg-surface-muted",
          )}
        >
          {item ? (
            <>
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                  {item.kind === "video" ? "Video" : "Article"}
                </span>
                <p className="mt-1 truncate text-[14px] font-bold text-ink">{item.title}</p>
                <p className="line-clamp-1 text-[12.5px] text-ink-faint">{item.excerpt}</p>
              </div>
              <a
                href={`/p/${item.postId}`}
                target={canEdit ? undefined : "_blank"}
                rel="noreferrer"
                onClick={(e) => canEdit && e.preventDefault()}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                <ArrowRight size={14} strokeWidth={2} />
              </a>
              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => setPickingIndex(i)}
                    className="absolute inset-0 rounded-xl"
                    aria-label="Đổi bài viết"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    aria-label="Bỏ bài viết"
                    className="absolute top-2 right-2 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </>
              )}
            </>
          ) : canEdit ? (
            <button
              type="button"
              onClick={() => setPickingIndex(i)}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 py-2 text-[13px] font-medium text-ink-faint hover:text-ink"
            >
              <Plus size={15} strokeWidth={2} />
              Thêm bài viết
            </button>
          ) : null}
        </div>
      ))}

      <CuratedItemPickerModal
        open={pickingIndex !== null}
        onOpenChange={(next) => {
          if (!next) setPickingIndex(null);
        }}
        onSelect={(item) => {
          if (pickingIndex !== null) setItem(pickingIndex, item);
        }}
      />
    </NodeViewWrapper>
  );
}
