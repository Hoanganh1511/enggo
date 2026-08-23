"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import type { ResizeDirection } from "@/lib/life-book/push-blocks";

const HANDLES: { direction: ResizeDirection; position: string; cursor: string }[] = [
  { direction: "n", position: "top-0 left-1/2 h-2 w-5 -translate-x-1/2 -translate-y-1/2", cursor: "ns-resize" },
  { direction: "s", position: "bottom-0 left-1/2 h-2 w-5 -translate-x-1/2 translate-y-1/2", cursor: "ns-resize" },
  { direction: "e", position: "top-1/2 right-0 h-5 w-2 -translate-y-1/2 translate-x-1/2", cursor: "ew-resize" },
  { direction: "w", position: "top-1/2 left-0 h-5 w-2 -translate-y-1/2 -translate-x-1/2", cursor: "ew-resize" },
  { direction: "ne", position: "top-0 right-0 size-2.5 -translate-y-1/2 translate-x-1/2", cursor: "nesw-resize" },
  { direction: "nw", position: "top-0 left-0 size-2.5 -translate-y-1/2 -translate-x-1/2", cursor: "nwse-resize" },
  { direction: "se", position: "bottom-0 right-0 size-2.5 translate-y-1/2 translate-x-1/2", cursor: "nwse-resize" },
  { direction: "sw", position: "bottom-0 left-0 size-2.5 translate-y-1/2 -translate-x-1/2", cursor: "nesw-resize" },
];

// 8 handle (4 canh N/S/E/W + 4 goc) - CHI render khi GridBlock dang hover
// (xem GridBlock.tsx). Moi handle chi bao onResizeStart(direction, e) - toan
// bo toan hoc/preview/push nam trong useBlockResize (PageGrid.tsx so huu),
// component nay thuan UI + cursor tuong ung tung huong.
export function ResizeHandles({
  onResizeStart,
}: {
  onResizeStart: (direction: ResizeDirection, e: ReactPointerEvent) => void;
}) {
  return (
    <>
      {HANDLES.map((h) => (
        <div
          key={h.direction}
          onPointerDown={(e) => onResizeStart(h.direction, e)}
          className={cn(
            "absolute z-10 touch-none rounded-full border border-white bg-ink/70",
            h.position,
          )}
          style={{ cursor: h.cursor }}
        />
      ))}
    </>
  );
}
