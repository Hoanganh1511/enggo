import { BookOpen, NotebookPen, type LucideIcon } from "lucide-react";

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
  // Mau chu dao (hex) CHO TUNG dich vu - dung o the tren HomeFeatureGrid/
  // ServiceCard de nhuom nen the + hinh decor (bong bay/cham luoi) qua
  // color-mix, KHONG lien quan gi toi iconBg/iconColor o tren (2 field do la
  // class Tailwind co dinh, dung cho 2 noi khac; accentColor la hex thuan de
  // tinh toan sac do linh hoat).
  accentColor: string;
  // Anh minh hoa rieng (PNG/SVG) dat trong public/services/ - optional, chua
  // co thi cac the/trang fallback ve icon-trong-box nhu cu (KHONG bia anh
  // gia). Nguoi dung tu cung cap file.
  image?: string;
};

// Nguon du lieu DUNG CHUNG cho the GL o trang chu (HomeFeatureGrid.tsx),
// popover "Services" tren header (HeaderServicesPopover.tsx), va trang
// /services (ServicesShell.tsx). Da BO het he thong category (SERVICE_
// CATEGORIES/categoryKey cu) theo yeu cau nguoi dung.
export const HOME_FEATURES: HomeFeature[] = [
  {
    slug: "life-book",
    title: "GL Life Book",
    description: "Cuốn sổ tay số hoá cuộc đời bạn - dạng tạp chí lật trang.",
    icon: BookOpen,
    iconBg: "bg-rose-500",
    iconColor: "text-rose-500",
    badge: "Sắp ra mắt",
    accentColor: "#f43f5e",
    // TODO: image: "/services/life-book.png" - cho nguoi dung gui file that.
  },
  // Tinh nang core CHUA co (nguoi dung se gui prompt rieng sau) - trang chi
  // tiet rieng tai src/app/(main)/services/daily-diary/page.tsx (moi dich
  // vu 1 thiet ke rieng, KHONG con dung chung 1 route dong /services/[slug]
  // nhu truoc).
  {
    slug: "daily-diary",
    title: "GL Daily Diary",
    description: "Nhật ký hằng ngày của bạn - ghi lại từng khoảnh khắc, mỗi ngày một trang.",
    icon: NotebookPen,
    iconBg: "bg-sky-500",
    iconColor: "text-sky-500",
    badge: "Sắp ra mắt",
    accentColor: "#0ea5e9",
  },
];
