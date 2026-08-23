"use client";

import { Heading, Image as ImageIcon, Table as TableIcon, Type } from "lucide-react";
import type { ToolKey } from "@/lib/life-book/create-canvas-element";
import { StickerLibraryPopover } from "./StickerLibraryPopover";

type BasicToolKey = Exclude<ToolKey, "sticker">;

const TOOLS: { key: BasicToolKey; label: string; icon: typeof Type }[] = [
  { key: "title", label: "Tiêu đề", icon: Heading },
  { key: "paragraph", label: "Đoạn văn", icon: Type },
  { key: "image", label: "Ảnh", icon: ImageIcon },
  { key: "table", label: "Bảng", icon: TableIcon },
];

// Toolbar trai (Sub-phase 6.3) - 2 cach tao element: (1) KEO tha vao canvas
// (native HTML5 Drag & Drop - `draggable` + dataTransfer, DON GIAN hon dung
// @dnd-kit vi drop target la 1 <canvas> Konva ve rieng, khong phai DOM node
// thuong ma dnd-kit hieu duoc; xem onDrop trong KonvaCanvas.tsx), (2) BAM
// truc tiep -> tao o vi tri mac dinh giua canvas (xem onToolClick). Sub-phase
// 6.6 - "Sticker" khong con la 1 nut tao-ngay nua ma la 1 Popover thu vien
// (StickerLibraryPopover.tsx, preset + upload rieng), nen tach khoi mang
// TOOLS dung chung va co prop rieng `onPickSticker`.
export function CanvasToolbar({
  onToolClick,
  onPickSticker,
}: {
  onToolClick: (tool: BasicToolKey) => void;
  onPickSticker: (src: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="px-1 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        Elements
      </p>
      {TOOLS.map((tool) => (
        <button
          key={tool.key}
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", tool.key);
            e.dataTransfer.effectAllowed = "copy";
          }}
          onClick={() => onToolClick(tool.key)}
          className="flex cursor-grab items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg active:cursor-grabbing"
        >
          <tool.icon size={16} strokeWidth={2} className="shrink-0 text-ink-muted" />
          {tool.label}
        </button>
      ))}
      <StickerLibraryPopover onPick={onPickSticker} />
      <p className="mt-1 px-1 text-[11px] text-ink-faint">
        Kéo vào canvas, hoặc bấm để tạo ở giữa.
      </p>
    </div>
  );
}
