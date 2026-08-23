"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiPage } from "@/lib/api/types";
import { useBookFlip } from "@/lib/life-book/use-book-flip";
import { BookPageFace } from "./BookPageFace";
import { BookCover } from "./BookCover";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./book-dimensions";

// Shell lat trang 3D - "click nua trai/phai de lat" (Phase 2) gio dua vao
// `onBackgroundClick` truyen xuong BookPageFace/PageGrid thay vi 1 nut phu
// vo hinh phu kin ca trang: Phase 3 them block/nut Add THAT SU can nhan
// click/drag truoc, 1 nut phu toan trang se "cuop" het moi tuong tac ben
// trong. PageGrid tu kiem tra `e.target === e.currentTarget` (chi bam dung
// vao NEN trong, khong phai bam vao 1 block roi noi len) truoc khi goi
// onBackgroundClick - xem PageGrid.tsx/BookPageFace.tsx. Toan bo logic lat
// (leaves/currentLeaf/flipping) nam trong useBookFlip - component nay CHI
// render dua tren state do.
//
// Hinh hoc lat: 1 div DUY NHAT dai dien "to giay" dang lat, LUON dat co dinh
// tai `left: PAGE_WIDTH` (khop vi tri trang PHAI) voi `transformOrigin: left
// center` (gay sach) - BAT KE dang lat next hay prev. rotateY=0 => nam dung
// vi tri da dat (trang phai, mat FRONT huong len). rotateY=-180 => xoay quanh
// gay sach, quet sang trai, ket thuc nam dung o vi tri trang trai (mat BACK,
// da duoc xoay san 180deg trong CSS, huong len). Next hoat hinh 0 -> -180,
// Prev hoat hinh NGUOC lai -180 -> 0 tren CHINH to vua lat truoc do - vi vay
// front LUON gan voi "phai", back LUON gan voi "trai", khong phu thuoc
// huong lat.
export function Book({ title, pages }: { title: string; pages: ApiPage[] }) {
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const {
    currentLeaf,
    leafCount,
    flipping,
    flippingLeaf,
    canNext,
    canPrev,
    next,
    prev,
    completeFlip,
    leftPage,
    rightPage,
  } = useBookFlip(sortedPages);

  const [coverOpen, setCoverOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Mobile: sach can khong gian ngang du rong cho 2 trang canh nhau -
          duoi 1024px chi hien thong bao thay vi ep layout vo hinh. */}
      <div className="flex flex-col items-center gap-2 py-16 lg:hidden">
        <p className="text-sm font-medium text-ink-muted">
          Vui lòng dùng desktop để mở GL Life Book.
        </p>
      </div>

      <div className="relative hidden lg:flex flex-col items-center gap-4">
        {!coverOpen ? (
          <BookCover title={title} onOpen={() => setCoverOpen(true)} />
        ) : (
          <div className="relative flex" style={{ perspective: 2400 }}>
            <div
              className="relative overflow-hidden rounded-l-lg border border-r-0 border-border bg-white shadow-lg"
              style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
            >
              {flipping?.direction !== "prev" && (
                <BookPageFace
                  page={leftPage}
                  side="left"
                  onBackgroundClick={canPrev ? prev : undefined}
                />
              )}
            </div>

            <div
              className="relative overflow-hidden rounded-r-lg border border-l-0 border-border bg-white shadow-lg"
              style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
            >
              {flipping?.direction !== "next" && (
                <BookPageFace
                  page={rightPage}
                  side="right"
                  onBackgroundClick={canNext ? next : undefined}
                />
              )}
            </div>

            {/* Gay sach - vach mo o giua */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-black/10" />

            <AnimatePresence>
              {flipping && (
                <motion.div
                  key={`${flipping.leafIndex}-${flipping.direction}`}
                  className="absolute top-0 z-30"
                  style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    left: PAGE_WIDTH,
                    transformStyle: "preserve-3d",
                    transformOrigin: "left center",
                  }}
                  initial={{ rotateY: flipping.direction === "next" ? 0 : -180 }}
                  animate={{ rotateY: flipping.direction === "next" ? -180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.45, 0.05, 0.55, 0.95] }}
                  onAnimationComplete={completeFlip}
                >
                  <div
                    className="absolute inset-0 overflow-hidden rounded-lg border border-border bg-white shadow-2xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <BookPageFace
                      page={flippingLeaf?.front ?? null}
                      side="right"
                      interactive={false}
                    />
                  </div>
                  <div
                    className="absolute inset-0 overflow-hidden rounded-lg border border-border bg-white shadow-2xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <BookPageFace
                      page={flippingLeaf?.back ?? null}
                      side="left"
                      interactive={false}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {coverOpen && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <span className="text-xs text-ink-faint">
              {currentLeaf} / {leafCount}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
