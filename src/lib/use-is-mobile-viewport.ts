"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 1023px)";

// Ngan Tailwind "lg" (1024px) - dung khi can RE HANH VI click (khong chi
// doi style) giua desktop/mobile, vd CreatorRail.tsx (mobile: mo modal xem
// truoc, desktop: di thang toi trang ca nhan) - CSS breakpoint don thuan
// (hidden lg:block) khong du vi 2 nhanh can onClick khac han nhau, khong
// phai chi khac giao dien.
//
// Dung useSyncExternalStore (khong phai useState+useEffect thu cong) - day
// la cach CHINH THONG cua React de dong bo voi 1 API ben ngoai
// (MediaQueryList): tu xu ly dung server snapshot (SSR luon coi la "khong
// phai mobile" - getServerSnapshot) VA client snapshot that, tranh hydration
// mismatch (server render 1 kieu, client lai render kieu khac ngay lan dau)
// ma 1 ban useState(lazy init tu window.matchMedia) tu viet tay se dinh
// phai. Cung tranh luon loi ESLint react-hooks/set-state-in-effect (xem
// docs/engineering-log.md 2026-07-28) vi khong con setState/useEffect thu
// cong nao o day nua.
function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobileViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
