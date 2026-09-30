"use client";

import { usePathname } from "next/navigation";

// An sidebar chinh (HomeDashboardSidebar) mot cach TINH/on dinh theo URL,
// KHONG lien quan gi den Focus mode store nua - yeu cau nguoi dung: "Lúc
// chuyển bài nó bị tắt focus mode xong lại bật lại. Tôi không thích trải
// nghiệm này. Ý là bỏ hẳn cái sidebar main đi. Focus mode không liên quan".
//
// Truoc day dung EntryAutoFocusMode.tsx (mount/unmount setActive(true/false)
// qua Focus mode store) - MOI LAN chuyen sang Entry khac, page.tsx cu UNMOUNT
// (setActive(false), sidebar tam thoi hien lai) roi page.tsx MOI mount ngay
// sau do (setActive(true) lai) - 2 buoc nay khong dam bao chay LIEN TUC trong
// CUNG 1 frame (React/browser co the ve lai 1 frame trung gian voi sidebar
// da hien) => nhay/giat that su nguoi dung thay duoc. Doi sang tinh THANG tu
// usePathname() (thuan render, KHONG qua effect/mount-unmount) loai bo hoan
// toan hien tuong nay - ket qua LUON on dinh dung ngay trong 1 lan render,
// khong con "tat roi bat lai".
//
// Pham vi giu NGUYEN y het truoc (chi doi CO CHE, khong doi PHAM VI): trang
// doc 1 Entry ("Chỉ trang đọc Entry" - Overview van giu sidebar) + khu vuc
// sua/tao Entry (manage/entries/...).
const HIDDEN_PATH_PATTERNS = [
  // /series/manage/entries, /series/manage/entries/new, /series/manage/entries/abc...
  /^\/series\/[^/]+\/manage\/entries(?:\/|$)/,
  // /series/[slug]/[entrySlug] (Entry doc that su - 2 segment, segment 2
  // KHONG phai "manage" hay "new"/"map" van tinh vi la 1 entrySlug hop le).
  /^\/series\/[^/]+\/(?!manage(?:\/|$))[^/]+$/,
];

export function useSeriesEntrySidebarHidden(): boolean {
  const pathname = usePathname();
  return HIDDEN_PATH_PATTERNS.some((re) => re.test(pathname));
}
