"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// "Lên đầu trang" RIENG cho khu vuc doc Series (Overview + moi Entry) - yeu
// cau nguoi dung: "Trang chi tiết (xem) bài viết, bổ sung thêm button tròn
// góc dưới bên phải scroll to top". Khac ScrollToTopButton.tsx (global,
// goc DUOI-TRAI, CHI hien tren mobile/tablet vi goc duoi-phai da danh cho
// MobileComposeFab - xem comment trong file do) - nut nay CHI hien tu `lg:`
// tro len (desktop), goc DUOI-PHAI dang con TRONG tren desktop (FAB viet bai
// la lg:hidden), khong dung lai global vi no bi khoa cung goc trai + rieng
// mobile, khong phu hop yeu cau lan nay.
export function SeriesScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>("[data-scroll-root]");
    if (!scrollRoot) return;
    function handleScroll() {
      setVisible(scrollRoot!.scrollTop > window.innerHeight * 0.6);
    }
    handleScroll();
    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        document.querySelector<HTMLElement>("[data-scroll-root]")?.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={cn(
        "fixed right-6 bottom-6 z-30 hidden size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-lg transition-all duration-200 ease-out hover:border-border-strong hover:text-ink lg:flex",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
