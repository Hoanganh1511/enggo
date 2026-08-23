"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookStore } from "@/lib/life-book/book-store";
import { useBlockResize } from "@/lib/life-book/use-block-resize";
import {
  GRID_COLS,
  GRID_ROWS,
  checkCollision,
  clampToGrid,
  findEmptySlot,
  gridRectToStyle,
  pxToGrid,
  type GridRect,
} from "@/lib/life-book/grid-utils";
import { GridBlock } from "./GridBlock";
import type { ApiPage } from "@/lib/api/types";

type DragPreview = GridRect & { valid: boolean };

// Luoi 10x14 tuong tac cua 1 trang (khong phai trang Muc luc) - readOnly=true
// dung cho 2 mat overlay dang lat 3D (Book.tsx), chi ve tinh, khong DndContext.
export function PageGrid({
  page,
  readOnly = false,
  onBackgroundClick,
}: {
  page: ApiPage;
  readOnly?: boolean;
  onBackgroundClick?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const draggingRef = useRef<{ id: string; startX: number; startY: number } | null>(null);

  const addBlock = useBookStore((s) => s.addBlock);
  const updateBlock = useBookStore((s) => s.updateBlock);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  // Phase 4 - resize 8 canh/goc, xem useBlockResize.ts. onCommit ap dung
  // TAT CA thay doi (block dang resize + moi block bi day, neu co) trong 1
  // lan, moi thay doi la 1 updateBlock() rieng (store da immer-batch trong
  // cung 1 tick React nen khong sinh nhieu ban ghi lich su undo/redo thua).
  const { resizingId, preview: resizePreview, startResize } = useBlockResize({
    blocks: page.blocks,
    containerRef,
    onCommit: (updates) => {
      for (const u of updates) {
        updateBlock(page.id, u.id, {
          gridX: u.gridX,
          gridY: u.gridY,
          gridW: u.gridW,
          gridH: u.gridH,
        });
      }
    },
  });

  if (readOnly) {
    return (
      <div className="relative h-full w-full">
        {page.blocks.map((block) => (
          <GridBlock key={block.id} block={block} readOnly />
        ))}
      </div>
    );
  }

  function handleDragStart(e: DragStartEvent) {
    const block = page.blocks.find((b) => b.id === e.active.id);
    if (!block) return;
    draggingRef.current = { id: block.id, startX: block.gridX, startY: block.gridY };
    setDragPreview({ ...block, valid: true });
  }

  function handleDragMove(e: DragMoveEvent) {
    const container = containerRef.current;
    const dragging = draggingRef.current;
    const block = page.blocks.find((b) => b.id === dragging?.id);
    if (!container || !dragging || !block) return;

    const rect = container.getBoundingClientRect();
    const deltaGridX = pxToGrid(e.delta.x, rect.width, GRID_COLS);
    const deltaGridY = pxToGrid(e.delta.y, rect.height, GRID_ROWS);
    const candidate = clampToGrid({
      gridX: dragging.startX + deltaGridX,
      gridY: dragging.startY + deltaGridY,
      gridW: block.gridW,
      gridH: block.gridH,
    });
    const others = page.blocks.filter((b) => b.id !== block.id);
    setDragPreview({ ...candidate, valid: !checkCollision(candidate, others) });
  }

  function handleDragEnd() {
    const dragging = draggingRef.current;
    if (dragging && dragPreview?.valid) {
      updateBlock(page.id, dragging.id, {
        gridX: dragPreview.gridX,
        gridY: dragPreview.gridY,
      });
    }
    // Khong lam gi khi khong valid - block KHONG duoc updateBlock() nen tu
    // "revert" ve vi tri cu (transform tu useDraggable cung tro ve 0 khi
    // drag ket thuc, dung nguyen tac cua dnd-kit).
    draggingRef.current = null;
    setDragPreview(null);
  }

  function handleAddBlock() {
    const slot = findEmptySlot(2, 2, page.blocks);
    if (!slot) return; // luoi day kin - im lang, khong bao loi on ao.
    addBlock(page.id, { gridX: slot.gridX, gridY: slot.gridY, gridW: 2, gridH: 2 });
  }

  const showGuides = hovering || dragPreview !== null || resizingId !== null;

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={containerRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) onBackgroundClick?.();
          }}
          className={cn(
            "relative h-full w-full",
            onBackgroundClick && "cursor-pointer",
          )}
        >
          {showGuides && <GridGuides />}
          {dragPreview && (
            <div
              className={cn(
                "pointer-events-none absolute rounded-sm border-2",
                dragPreview.valid
                  ? "border-emerald-400 bg-emerald-400/15"
                  : "border-rose-400 bg-rose-400/15",
              )}
              style={gridRectToStyle(dragPreview)}
            />
          )}

          {/* Preview resize: xanh nhat = vi tri block se chiem, xam de len
              TUNG block bi va cham (spec: rgba(0,0,0,0.3)). */}
          {resizePreview && (
            <div
              className="pointer-events-none absolute rounded-sm border-2 border-sky-400 bg-sky-400/15"
              style={gridRectToStyle(resizePreview.rect)}
            />
          )}
          {resizePreview?.overlappedIds.map((id) => {
            const overlapped = page.blocks.find((b) => b.id === id);
            if (!overlapped) return null;
            return (
              <div
                key={id}
                className="pointer-events-none absolute rounded-md"
                style={{ ...gridRectToStyle(overlapped), background: "rgba(0,0,0,0.3)" }}
              />
            );
          })}

          {page.blocks.map((block) => (
            <GridBlock
              key={block.id}
              block={block}
              onResizeStart={startResize}
            />
          ))}
        </div>
      </DndContext>

      <button
        type="button"
        onClick={handleAddBlock}
        title="Add block"
        className="absolute top-1 right-1 z-20 grid size-6 cursor-pointer place-items-center rounded-md border border-border bg-white text-ink-faint transition-colors duration-150 ease-out hover:text-ink"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function GridGuides() {
  return (
    <div
      className="pointer-events-none absolute inset-0 text-ink opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
        backgroundSize: `${100 / GRID_COLS}% ${100 / GRID_ROWS}%`,
      }}
    />
  );
}
