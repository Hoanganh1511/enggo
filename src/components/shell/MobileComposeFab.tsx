"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquarePen } from "lucide-react";
import { useMobileFabBottomOffset } from "@/lib/use-mobile-fab-bottom-offset";

// "Viết bài" tren mobile/tablet (<lg) la 1 nut icon-only fixed goc
// duoi-phai thay cho pill chu trong header (an o do tren mobile, xem
// TopHeaderBar.tsx) - hien TREN MOI TRANG (khong rieng /home) TRU chinh
// /compose (da o do, FAB thua) VA /home (co ban rieng gom san trong cum
// Roadmap/Weekly Progress, xem HomeMobileQuickPanels.tsx - tranh 2 nut
// chong nhau cung 1 vi tri fixed). bottom dong (useMobileFabBottomOffset) -
// tu day len cao hon o /p/[id] de khong bi ArticleActionBar (cum fixed
// duoi cung, xem file do) de len.
export function MobileComposeFab() {
  const pathname = usePathname();
  const bottom = useMobileFabBottomOffset();
  if (pathname === "/compose" || pathname === "/home") return null;

  return (
    <Link
      href="/compose"
      aria-label="Viết bài"
      style={{ bottom }}
      className="fixed right-4 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/90 text-white shadow-lg transition-[bottom] duration-150 ease-out hover:opacity-90 lg:hidden"
    >
      <SquarePen size={19} aria-hidden="true" />
    </Link>
  );
}
