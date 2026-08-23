"use client";

import { memo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { gridRectToStyle } from "@/lib/life-book/grid-utils";
import { useBookStore } from "@/lib/life-book/book-store";
import type { ResizeDirection } from "@/lib/life-book/push-blocks";
import { ResizeHandles } from "./ResizeHandles";
import type { ApiBlock } from "@/lib/api/types";

// 1 block that tren luoi - `setNodeRef`/transform nam o DIV NGOAI (toan bo
// vung block, vi tri/kich thuoc theo %) con `listeners` (kich hoat keo) CHI
// gan vao DIV TRONG, thut vao 6px so voi canh - CANH block danh rieng cho 8
// resize handle (ResizeHandles.tsx, hien khi hover), giua block moi keo
// duoc, dung yeu cau "chi drag khi giu vao body".
//
// Kich thuoc/vi tri hien thi CUA CHINH block nay KHONG doi trong luc resize
// (van ve theo block.gridX/Y/W/H that tu store) - PageGrid.tsx ve 1 overlay
// RIENG (xanh nhat = vi tri se chiem, xam = block khac se bi de) de nguoi
// dung thay preview MA khong phai lam GridBlock tu "phinh to" giua chung -
// chi commit vao store 1 lan luc tha chuot (xem useBlockResize).
//
// readOnly=true (dung cho 2 mat cua overlay lat trang dang animate, xem
// Book.tsx) - VAN goi useDraggable (Rules of Hooks) nhung KHONG gan listeners/
// resize handle, tranh nguoi dung vo tinh keo/resize trong luc trang dang
// xoay 3D.
//
// Click (khong phai keo) mo BlockModal.tsx qua store.openBlock() - TU DO
// dung layoutId (da bo, xem lich su): block nam LONG trong cay 3D
// (perspective/preserve-3d/rotateY cua Book.tsx khi lat trang) - he thong
// "layout projection" cua framer-motion gia dinh layout 2D thuong va tinh
// SAI (co the ra kich thuoc 0, khong bao loi console) khi to tien co
// transform 3D dang hoat dong, gay hien tuong block "bien mat" ngay khi
// animation lat trang vua ket thuc (readOnly overlay khong co layoutId ->
// interactive instance MOI co -> dung luc do 3D transform cua Book.tsx cha
// no VUA ON DINH lai). Chuyen sang cach THU HAI ma spec goc da cho phep: tu
// getBoundingClientRect() ngay luc click, luu vao store (openBlockOrigin),
// BlockModal.tsx animate initial/animate THU CONG tu toa do do - khong dua
// vao he thong FLIP tu dong cua framer nua nen khong con dinh loi 3D nay.
//
// memo() - PageGrid.tsx setState 1 lan/frame (rAF-batched) trong luc keo/
// resize CHO CA TRANG (dragPreview/resizePreview), khien PageGrid re-render
// lien tuc; KHONG memo se lam TAT CA block khac tren cung trang (kho phai
// block dang duoc keo/resize) re-render an theo moi frame du props cua
// chung khong doi gi ca - anh huong ro khi trang co 10+ block. `block`
// (object) tu store CHI doi reference dung PHAN TU thuc su bi cap nhat
// (immer), nen so sanh nong can mac dinh cua memo la du, khong can
// comparator rieng.
export const GridBlock = memo(function GridBlock({
  block,
  readOnly = false,
  onResizeStart,
}: {
  block: ApiBlock;
  readOnly?: boolean;
  onResizeStart?: (blockId: string, direction: ResizeDirection, e: ReactPointerEvent) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: block.id, disabled: readOnly });
  const openBlock = useBookStore((s) => s.openBlock);

  const outerStyle: CSSProperties = {
    ...gridRectToStyle(block),
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 40 : hovering ? 8 : 5,
  };

  return (
    <div
      ref={setNodeRef}
      style={outerStyle}
      className="absolute"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        {...(readOnly ? {} : listeners)}
        {...(readOnly ? {} : attributes)}
        onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
          if (isDragging || readOnly) return;
          const rect = e.currentTarget.getBoundingClientRect();
          openBlock(block.id, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          });
        }}
        className={cn(
          "absolute inset-1.5 rounded-md border border-border bg-surface-muted transition-shadow duration-150 ease-out",
          !readOnly && "touch-none cursor-grab active:cursor-grabbing",
          isDragging ? "opacity-80 shadow-lg" : !readOnly && "hover:border-ink/30",
        )}
      />

      {!readOnly && hovering && !isDragging && onResizeStart && (
        <ResizeHandles
          onResizeStart={(direction, e) => onResizeStart(block.id, direction, e)}
        />
      )}
    </div>
  );
});
