import { BookOpen, type LucideIcon } from "lucide-react";

export type HomeFeature = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  // Dung cho the 3D o HomeFeatureGrid.tsx (box nen dam mau + icon trang).
  iconBg: string;
  // Dung cho popover Services o header (HeaderServicesPopover.tsx) - box nen
  // trung tinh (trang/xam nhe), CHI icon glyph to mau rieng theo tung dich
  // vu (nguoi dung xac nhan kieu nay, khong dung lai kieu box dam mau nhu
  // the 3D o trang chu).
  iconColor: string;
  // Nhan trang thai NHO canh title (vd "Sắp ra mắt") - optional, chi hien
  // khi co gia tri. Rieng cho popover Services (HeaderServicesPopover.tsx).
  badge?: string;
};

// Nguon du lieu DUNG CHUNG cho the GL o trang chu (HomeFeatureGrid.tsx),
// popover "Services" tren header (HeaderServicesPopover.tsx), va trang
// /services (ServicesShell.tsx). Da BO het he thong category (SERVICE_
// CATEGORIES/categoryKey cu) theo yeu cau nguoi dung - chi con DUY NHAT 1
// dich vu that dang xay: GL Life Book.
export const HOME_FEATURES: HomeFeature[] = [
  {
    slug: "life-book",
    title: "GL Life Book",
    description: "Cuốn sổ tay số hoá cuộc đời bạn - dạng tạp chí lật trang.",
    icon: BookOpen,
    iconBg: "bg-rose-500",
    iconColor: "text-rose-500",
    badge: "Sắp ra mắt",
  },
];
