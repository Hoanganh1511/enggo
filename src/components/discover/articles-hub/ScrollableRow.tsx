"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Boc quanh 1 hang cuon ngang (CreatorRail/TopicsRail/moi hang trong
// NewestSection) them nut prev/next - MOI LAN bam next/prev cuon dung 2 the
// (do tu do rong 2 the DAU trong hang, gia dinh cac the trong 1 hang gan bang
// nhau). "Prev" CHI hien sau khi da cuon toi (scrollLeft > 0) - doc dung
// scrollLeft that (khong phai 1 co bam-la-nho) nen neu nguoi dung tu keo tay
// ve dau, prev tu an lai dung nhu luc chua bam gi. "Next" tu an khi da cuon
// het (khong con gi de cuon them).
export function ScrollableRow({
  children,
  gapClassName = "gap-4",
  itemsPerStep = 2,
}: {
  children: React.ReactNode;
  gapClassName?: string;
  itemsPerStep?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function scrollByStep(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (items.length === 0) return;
    const sample = items.slice(0, itemsPerStep);
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    const distance = sample.reduce((sum, item) => sum + item.getBoundingClientRect().width + gap, 0);
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className={cn("scrollbar-none flex overflow-x-auto pb-1", gapClassName)}
      >
        {children}
      </div>

      {/* Nut nam TRON VEN trong bien cua wrapper (khong con -translate-x-1/3
          /translate-x-1/3 de "loi" ra ngoai mep phai/trai) - ban truoc day
          khien nut next thuc su rong hon document ~11px (khong co
          overflow-hidden nao chan lai o ancestor), gay tran ngang toan trang
          moi khi 1 hang ScrollableRow nam sat mep phai vung noi dung (dung
          nguyen nhan gay thanh scroll ngang o /articles). */}
      {canPrev && (
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          aria-label="Xem trước"
          className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-hover)] transition hover:scale-105"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          aria-label="Xem tiếp"
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-hover)] transition hover:scale-105"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
