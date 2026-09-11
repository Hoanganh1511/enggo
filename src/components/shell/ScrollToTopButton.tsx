"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useMobileFabBottomOffset } from "@/lib/use-mobile-fab-bottom-offset";

// Nut "len dau trang" tren mobile/tablet (<lg), hien o BAT KY trang nao khi
// da cuon qua 1 man hinh (window.innerHeight) - vung cuon THAT cua app la
// div [data-scroll-root] (MainContentArea.tsx, overflow-auto), KHONG phai
// window (window khong cuon - <body> khoa overflow-hidden, xem app/layout.tsx).
// Dat GOC DUOI-TRAI (doi dien MobileComposeFab/HomeMobileQuickPanels o
// goc phai) de khong phai tinh toan tranh 2 cum nut do - chi con rieng
// ArticleActionBar (/p/[id], thanh FULL-WIDTH duoi cung) can tru khoang
// cach, dung chung useMobileFabBottomOffset() voi FAB vi cung 1 khoang can
// tru.
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const bottom = useMobileFabBottomOffset();

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>("[data-scroll-root]");
    if (!scrollRoot) return;
    function handleScroll() {
      setVisible(scrollRoot!.scrollTop > window.innerHeight);
    }
    handleScroll();
    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={() => {
        document
          .querySelector<HTMLElement>("[data-scroll-root]")
          ?.scrollTo({ top: 0, behavior: "smooth" });
      }}
      style={{ bottom }}
      className="fixed left-4 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-lg transition-[bottom,opacity] duration-150 ease-out hover:bg-hover-bg hover:text-ink lg:hidden"
    >
      <ArrowUp size={18} strokeWidth={2.2} />
    </button>
  );
}
