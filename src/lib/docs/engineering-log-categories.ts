// Phan loai THU CONG cho tung entry trong docs/engineering-log.md - file log
// goc CHI ghi theo thoi gian (khong co the loai san), nen viec "gom nhom theo
// danh muc" cho trang /docs la 1 lop trinh bay RIENG, KHONG sua noi dung goc
// cua engineering-log.md (file do co quy uoc rieng: ghi lai CACH TU DUY, giu
// nguyen van, khong viet lai lich su - xem dong dau file).
//
// Khop theo 1 doan con PHAN BIET duoc trong tieu de (khong can nguyen van ca
// tieu de) - de dieu chinh nhe tieu de goc sau nay khong lam vo mapping.
export type EngineeringLogCategory =
  | "Kiến trúc & Dữ liệu"
  | "React & Next.js"
  | "UI/UX & Sản phẩm";

export const ENGINEERING_LOG_CATEGORY_ORDER: EngineeringLogCategory[] = [
  "Kiến trúc & Dữ liệu",
  "React & Next.js",
  "UI/UX & Sản phẩm",
];

// title -> category | "hidden" (loai khoi UI, nhung KHONG xoa khoi file goc -
// vd 1 entry da bi chinh no ghi ro la "LỖI THỜI", giu lai trong git history
// nhung khong nen hien trong 1 trang docs da danh bong).
const CATEGORY_RULES: { match: string; category: EngineeringLogCategory | "hidden" }[] = [
  { match: "Tin nhắn tự gửi bị lệch vị trí", category: "Kiến trúc & Dữ liệu" },
  { match: "Sửa nền/toolbar/banner", category: "React & Next.js" },
  { match: "Đổi concept trang chọn Workspace", category: "UI/UX & Sản phẩm" },
  { match: "Redesign màn Workspace Detail", category: "UI/UX & Sản phẩm" },
  { match: "Làm lại /community/[slug]", category: "UI/UX & Sản phẩm" },
  { match: "/series, /contest có sidebar", category: "React & Next.js" },
  { match: "Card Series dẫn sang trang Community", category: "UI/UX & Sản phẩm" },
  { match: "Sửa lại `/p/[slug]`", category: "Kiến trúc & Dữ liệu" },
  { match: "Trang chi tiết bài viết long-form", category: "hidden" },
  { match: "Home feed: SSR hoá fetch", category: "React & Next.js" },
  { match: 'Post kind "skill-report"', category: "React & Next.js" },
  { match: "Header nháy sai UI", category: "React & Next.js" },
  { match: "Phân loại node (branch/topic)", category: "UI/UX & Sản phẩm" },
  { match: "Follow/Block giữa các tài khoản", category: "Kiến trúc & Dữ liệu" },
  { match: "Thêm `Document.overview`", category: "Kiến trúc & Dữ liệu" },
];

export function categorizeEngineeringLogEntry(
  title: string,
): EngineeringLogCategory | "hidden" {
  const rule = CATEGORY_RULES.find((r) => title.includes(r.match));
  // Entry moi chua co trong CATEGORY_RULES (vd them qua thoi quen ghi
  // engineering log sau nay) roi vao day - hien nhung xep nhom "khac" thay vi
  // bien mat, de khong ai quen cap nhat mapping ma mat noi dung that.
  return rule?.category ?? "Kiến trúc & Dữ liệu";
}
