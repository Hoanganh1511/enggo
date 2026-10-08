"use client";

import { useEffect, useState } from "react";

// [2026-10-08] Tach tu TaskTypePicker.tsx (component DAU TIEN can phan biet
// mobile/desktop de doi HAN layout - bottom sheet vs popover neo trigger) -
// TaskListView.tsx cung can (swipe gesture CHI mobile, hover-actions CHI
// desktop, xem spec "Responsive"), nen dua ra file rieng de dung CHUNG thay
// vi lap lai dinh nghia.

// Dung cung moc voi Tailwind `sm` (640px) de nhat quan voi phan con lai cua
// app.
export const MOBILE_BREAKPOINT_PX = 640;

function matchesMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`).matches;
}

export function useIsMobile(): boolean {
  // Lazy initializer (khong phai setState trong THAN effect) - tranh
  // cascading render React flag (react-hooks/set-state-in-effect). Gia tri
  // dung NGAY tu lan render dau (component "use client", chi mount phia
  // client), effect ben duoi CHI con dung de LANG NGHE thay doi (resize qua
  // breakpoint).
  const [isMobile, setIsMobile] = useState(matchesMobile);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    function handler(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}
