"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquarePen } from "lucide-react";

// "Viết bài" tren mobile/tablet (<lg) la 1 nut icon-only fixed goc
// duoi-phai thay cho pill chu trong header (an o do tren mobile, xem
// TopHeaderBar.tsx) - hien TREN MOI TRANG (khong rieng /home) TRU chinh
// /compose (da o do, FAB thua) VA /home (co ban rieng gom san trong cum
// Roadmap/Weekly Progress, xem HomeMobileQuickPanels.tsx - tranh 2 nut
// chong nhau cung 1 vi tri fixed).
export function MobileComposeFab() {
  const pathname = usePathname();
  if (pathname === "/compose" || pathname === "/home") return null;

  return (
    <Link
      href="/compose"
      aria-label="Viết bài"
      className="fixed right-4 bottom-4 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/90 text-white shadow-lg hover:opacity-90 lg:hidden"
    >
      <SquarePen size={19} aria-hidden="true" />
    </Link>
  );
}
