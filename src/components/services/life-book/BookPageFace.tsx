import { cn } from "@/lib/utils";
import { PageGrid } from "./PageGrid";
import type { ApiPage } from "@/lib/api/types";

// 1 MAT trang (khong phai 1 "to") - page null = trang trang (khong co gi
// duoi to cuoi cung, xem useBookFlip.toLeaves). page.order===0 luon la Muc
// luc (rong, KHONG co luoi block - se sinh tu dong o phase sau), cac trang
// khac render <PageGrid /> (luoi 10x14 that, xem PageGrid.tsx).
//
// `interactive=false` dung cho 2 mat cua overlay dang lat 3D (Book.tsx) -
// PageGrid chuyen sang readOnly (khong DndContext/nut Add/guides) de tranh
// keo/them block duoc trong luc trang dang xoay giua khong trung.
//
// `onBackgroundClick` - "click vao trang de lat" (Book.tsx) - CHI kich hoat
// khi bam dung vao NEN (khong phai bubble tu 1 block ben trong), kiem tra
// `e.target === e.currentTarget` o day va trong PageGrid.tsx.
export function BookPageFace({
  page,
  side,
  interactive = true,
  onBackgroundClick,
}: {
  page: ApiPage | null;
  side: "left" | "right";
  interactive?: boolean;
  onBackgroundClick?: () => void;
}) {
  if (!page) {
    return (
      <div
        onClick={onBackgroundClick}
        className={cn("h-full bg-white", onBackgroundClick && "cursor-pointer")}
      />
    );
  }

  const isToc = page.order === 0;
  const isEmpty = !isToc && page.blocks.length === 0;

  return (
    <div className="relative h-full bg-white p-3">
      {isToc ? (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onBackgroundClick?.();
          }}
          className={cn(
            "flex h-full items-center justify-center",
            onBackgroundClick && "cursor-pointer",
          )}
        >
          <span className="pointer-events-none text-sm font-semibold tracking-[0.2em] text-ink-faint uppercase">
            Table of Contents
          </span>
        </div>
      ) : (
        <PageGrid
          page={page}
          readOnly={!interactive}
          onBackgroundClick={onBackgroundClick}
        />
      )}

      {isEmpty && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-faint italic">
          Empty page — click to add blocks
        </span>
      )}

      <span
        className={cn(
          "pointer-events-none absolute bottom-1 text-[10px] text-ink-faint",
          side === "left" ? "left-2" : "right-2",
        )}
      >
        {page.order + 1}
      </span>
    </div>
  );
}
