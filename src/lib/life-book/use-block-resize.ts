"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { toast } from "@/lib/toast/toast-store";
import { GRID_COLS, GRID_ROWS, checkCollision, type GridRect } from "./grid-utils";
import { applyResizeDelta, clampResizeToBounds } from "./resize-math";
import { pushBlocks, type PushableBlock, type ResizeDirection } from "./push-blocks";

export type ResizePreview = {
  rect: GridRect;
  overlappedIds: string[];
};

// Keo 1 resize handle: track vi tri chuot qua window (khong phai chi trong
// pham vi block/container, vi chuot co the vuot ra ngoai luc keo nhanh) -
// gop nhieu pointermove lien tiep vao 1 requestAnimationFrame (constraint
// "khong setState qua nhieu lan") thay vi setState tren TUNG event. Chi
// COMMIT vao store (qua onCommit) luc pointerup - trong luc keo CHI cap
// nhat `preview` (local state, khong dung store) nen huy nua chung (nha
// chuot ngoai luoi, Esc...) khong de lai dau vet gi trong du lieu that.
export function useBlockResize({
  blocks,
  containerRef,
  onCommit,
}: {
  blocks: PushableBlock[];
  containerRef: RefObject<HTMLDivElement | null>;
  onCommit: (updates: PushableBlock[]) => void;
}) {
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ResizePreview | null>(null);

  const sessionRef = useRef<{
    blockId: string;
    direction: ResizeDirection;
    startRect: GridRect;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPointRef = useRef<{ x: number; y: number } | null>(null);
  // Ban sao LUON MOI NHAT cua preview, doc trong handlePointerUp (dinh nghia
  // trong useEffect voi deps KHONG bao gom `preview` - co y de khong phai
  // go/gan lai window listener moi lan preview doi trong luc keo, xem
  // comment o useEffect ben duoi). Neu doc thang state `preview` qua closure
  // o day se bi "stale closure" - luon thay gia tri LUC BAT DAU keo, khong
  // phai gia tri MOI NHAT ngay truoc khi tha chuot.
  const previewRef = useRef<ResizePreview | null>(null);

  const startResize = useCallback(
    (blockId: string, direction: ResizeDirection, e: React.PointerEvent) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;
      e.preventDefault();
      e.stopPropagation();

      sessionRef.current = {
        blockId,
        direction,
        startRect: {
          gridX: block.gridX,
          gridY: block.gridY,
          gridW: block.gridW,
          gridH: block.gridH,
        },
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      const initialPreview = { rect: sessionRef.current.startRect, overlappedIds: [] };
      previewRef.current = initialPreview;
      setResizingId(blockId);
      setPreview(initialPreview);
    },
    [blocks],
  );

  const recomputePreview = useCallback(() => {
    const session = sessionRef.current;
    const point = pendingPointRef.current;
    const container = containerRef.current;
    if (!session || !point || !container) return;

    const rect = container.getBoundingClientRect();
    const dGridX = Math.round(((point.x - session.startClientX) / rect.width) * GRID_COLS);
    const dGridY = Math.round(((point.y - session.startClientY) / rect.height) * GRID_ROWS);

    const grown = applyResizeDelta(session.startRect, session.direction, dGridX, dGridY);
    const clamped = clampResizeToBounds(grown);

    const others = blocks.filter((b) => b.id !== session.blockId);
    const overlappedIds = others
      .filter((b) => checkCollision(clamped, [b]))
      .map((b) => b.id);

    const next = { rect: clamped, overlappedIds };
    previewRef.current = next;
    setPreview(next);
  }, [blocks, containerRef]);

  useEffect(() => {
    if (!resizingId) return;

    function handlePointerMove(e: PointerEvent) {
      pendingPointRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        recomputePreview();
      });
    }

    function handlePointerUp() {
      const session = sessionRef.current;
      const finalPreview = previewRef.current;
      sessionRef.current = null;
      previewRef.current = null;
      setResizingId(null);
      setPreview(null);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (!session || !finalPreview) return;

      const resizedBlock: PushableBlock = { id: session.blockId, ...finalPreview.rect };
      const others: PushableBlock[] = blocks.filter((b) => b.id !== session.blockId);

      const result = pushBlocks(resizedBlock, others, session.direction);
      if (!result.success) {
        toast.warning("Không đủ chỗ để mở rộng");
        return;
      }

      const changedPushed = result.newBlocks.filter((updatedBlock) => {
        const original = others.find((b) => b.id === updatedBlock.id);
        return (
          original &&
          (original.gridX !== updatedBlock.gridX || original.gridY !== updatedBlock.gridY)
        );
      });

      onCommit([resizedBlock, ...changedPushed]);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizingId, recomputePreview]);

  return { resizingId, preview, startResize };
}
