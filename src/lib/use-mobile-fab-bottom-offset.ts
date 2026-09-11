"use client";

import { usePathname } from "next/navigation";

// Cac nut fixed goc duoi-phai tren mobile (MobileComposeFab.tsx,
// ScrollToTopButton.tsx) mac dinh dat bottom-4 (16px) - RIENG trang chi
// tiet bai viet (/p/[id]) co them 1 cum ArticleActionBar dinh CO DINH sat
// day man hinh (cao ~56px + safe-area, xem ArticleActionBar.tsx ban mobile
// sticky) nen phai day cac nut nay len cao hon, khong thi bi de/chen mat.
// Dung 1 hook dung chung thay vi lap dieu kien pathname o tung component -
// them trang nao khac co cum fixed tuong tu sau nay chi can sua 1 cho.
const PAGES_WITH_BOTTOM_ACTION_BAR = [/^\/p\//];

export function useMobileFabBottomOffset(): string {
  const pathname = usePathname();
  const hasBottomActionBar = PAGES_WITH_BOTTOM_ACTION_BAR.some((re) => re.test(pathname));
  return hasBottomActionBar
    ? "calc(56px + env(safe-area-inset-bottom) + 16px)"
    : "16px";
}
