"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Carousel ngang dung chung cho Featured/Trending Topics/Resources/Projects/
// Achievements - thuan CSS scroll-snap + nut mui ten (khong them thu vien
// carousel nao), dung dung pattern da co san o HomeRightPanel.tsx.
export function HorizontalScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <div className="group/scroller relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Cuộn sang trái"
        className="absolute top-1/2 left-0 hidden size-8 -translate-x-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint opacity-0 shadow-dropdown transition-opacity duration-150 ease-out group-hover/scroller:opacity-100 hover:bg-hover-bg hover:text-ink sm:flex"
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Cuộn sang phải"
        className="absolute top-1/2 right-0 hidden size-8 -translate-y-1/2 translate-x-3 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint opacity-0 shadow-dropdown transition-opacity duration-150 ease-out group-hover/scroller:opacity-100 hover:bg-hover-bg hover:text-ink sm:flex"
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}
