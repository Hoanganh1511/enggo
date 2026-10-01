"use client";

import { useRef } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Loader2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";

// [2026-10-02] NodeView rieng cho "image" - yeu cau nguoi dung: "lúc paste
// ảnh vào không có UI/UX gì cho việc đang chuẩn bị ảnh, hay tải ảnh gì" +
// ngay sau do "chưa có chỗ chỉnh size hiển thị ảnh, vị trí trái, phải, chính
// giữa". NodeView nay gom CA 2 yeu cau (cung tac dong len 1 node "image"):
// - Preview + overlay "Đang tải ảnh lên..." luc attrs.uploading=true (xem
//   image-upload-with-preview.ts) - src luc nay la 1 object URL LOCAL cua
//   CHINH file vua dan/tha, khong phai URL that tren S3.
// - Toolbar noi (AlignLeft/Center/Right) + tay keo o goc duoi-phai de doi
//   `width` (px) - CHI hien khi node dang duoc CHON (selected, tuc bam vao
//   anh) va KHONG con dang upload (tranh thao tac nham len 1 anh chua co URL
//   that). 2 attrs `width`/`align` duoc doc/ghi lai dung vi tri trong
//   markdown qua addAttributes() cua ImageWithBlockMarkdown (post-extensions.ts).
export function ImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title, uploading, width, align } = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    uploading?: boolean;
    width?: number | null;
    align?: "left" | "center" | "right";
  };
  const imgRef = useRef<HTMLImageElement>(null);
  const showControls = selected && !uploading;

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const imgEl = imgRef.current;
    if (!imgEl) return;
    const startX = e.clientX;
    const startWidth = imgEl.getBoundingClientRect().width;
    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startX;
      // Toi thieu 80px - tranh keo ve 0/am lam anh bien mat hoan toan.
      const newWidth = Math.max(80, Math.round(startWidth + delta));
      updateAttributes({ width: newWidth });
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <NodeViewWrapper
      className="flex"
      style={{ justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center" }}
      data-drag-handle
    >
      <div
        className="group relative inline-block max-w-full"
        style={{ width: width ? `${width}px` : undefined }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- src co the la blob: URL (preview luc dang upload, next/image khong ho tro) hoac URL S3 tuy y, khong the biet truoc domain de dung next/image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          title={title || undefined}
          className={cn("max-w-full", uploading && "opacity-50")}
          style={{ width: width ? "100%" : undefined }}
        />
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-ink/5 text-[12.5px] font-medium text-ink-muted">
            <Loader2 size={15} strokeWidth={2} className="animate-spin" />
            Đang tải ảnh lên...
          </span>
        )}
        {showControls && (
          <>
            <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
              <button
                type="button"
                title="Căn trái"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAttributes({ align: "left" })}
                className={cn(
                  "flex size-6 cursor-pointer items-center justify-center rounded text-ink-muted hover:bg-hover-bg hover:text-ink",
                  align === "left" && "bg-hover-bg text-ink",
                )}
              >
                <AlignLeft size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Căn giữa"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAttributes({ align: "center" })}
                className={cn(
                  "flex size-6 cursor-pointer items-center justify-center rounded text-ink-muted hover:bg-hover-bg hover:text-ink",
                  (align ?? "center") === "center" && "bg-hover-bg text-ink",
                )}
              >
                <AlignCenter size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Căn phải"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAttributes({ align: "right" })}
                className={cn(
                  "flex size-6 cursor-pointer items-center justify-center rounded text-ink-muted hover:bg-hover-bg hover:text-ink",
                  align === "right" && "bg-hover-bg text-ink",
                )}
              >
                <AlignRight size={13} strokeWidth={2} />
              </button>
            </div>
            {/* Tay keo doi kich thuoc - goc duoi-phai, dung quy uoc pho bien
                cua cac trinh soan rich-text (Google Docs/Notion...). */}
            <div
              onMouseDown={startResize}
              title="Kéo để đổi kích thước"
              className="absolute right-0 bottom-0 size-3.5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border-2 border-surface bg-primary"
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary" />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
