import type { CSSProperties } from "react";

// 6 kieu nen vung tin nhan (tham khao tu demo nguoi dung dua) + 1 lua chon
// "Mặc định" - CHI doi NEN vung chat, KHONG doi mau bubble (xem comment chi
// tiet o ban truoc cua file nay/MessagesShell.tsx).
//
// Ban DAU dung 1 <svg> con rieng dat absolute de ve pattern (giong y het
// demo nguoi dung dua) - THUC TE bi loi "chỉ đổi màu, không có pattern":
// modal hien CA 7 thumbnail CUNG LUC, moi thumbnail la 1 <svg> rieng nhung
// DUNG CHUNG 1 id="chatbg-..." (vi cung 1 object JSX trong mang nay duoc
// render lai o NHIEU noi - modal + khung chat that) - id pattern SVG phai
// DUY NHAT trong ca trang, trung id khien fill="url(#id)" khong resolve
// dung, tuy trinh duyet co the fill: none (vo hinh). Doi sang CSS thuan
// (background-image: radial-gradient/repeating-linear-gradient) - khong con
// DOM con nao ca, khong the trung id, va tu dong hoat dong giong het nhau o
// CA thumbnail lan khung chat that vi chi la 1 style object dung lai.
export type ChatBackground = {
  id: string;
  label: string;
  sub: string;
  // Tailwind class cho mau/gradient NEN (khong doi).
  base: string;
  // Style CSS THUAN cho lop pattern (background-image + background-size) -
  // undefined = khong co pattern (lua chon "Mặc định").
  patternStyle?: CSSProperties;
};

export const CHAT_BACKGROUNDS: ChatBackground[] = [
  {
    id: "none",
    label: "Mặc định",
    sub: "Nền xám nhạt hiện tại",
    base: "bg-slate-50",
  },
  {
    id: "dotgrid",
    label: "Dot Grid",
    sub: "Chấm bi nhạt kiểu WhatsApp",
    base: "bg-emerald-50",
    patternStyle: {
      backgroundImage: "radial-gradient(circle, #34d399aa 1.6px, transparent 1.6px)",
      backgroundSize: "22px 22px",
    },
  },
  {
    id: "linegrid",
    label: "Graph Lines",
    sub: "Kẻ ô li mỏng kiểu giấy vở",
    base: "bg-sky-50",
    patternStyle: {
      backgroundImage:
        "linear-gradient(to right, #7dd3fc80 1px, transparent 1px), linear-gradient(to bottom, #7dd3fc80 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    },
  },
  {
    id: "diagonal",
    label: "Diagonal Stripes",
    sub: "Sọc chéo tinh tế",
    base: "bg-amber-50",
    patternStyle: {
      backgroundImage:
        "repeating-linear-gradient(45deg, #fbbf2466 0, #fbbf2466 4px, transparent 4px, transparent 16px)",
    },
  },
  {
    id: "bubbles",
    label: "Floating Circles",
    sub: "Vòng tròn nổi bồng bềnh",
    base: "bg-gradient-to-br from-indigo-50 to-purple-50",
    patternStyle: {
      backgroundImage:
        "radial-gradient(circle at 6% 8%, #c7d2fe66 0%, transparent 12%), " +
        "radial-gradient(circle at 88% 30%, #e9d5ff80 0%, transparent 9%), " +
        "radial-gradient(circle at 18% 78%, #a5b4fc4d 0%, transparent 11%), " +
        "radial-gradient(circle at 70% 82%, #e9d5ff66 0%, transparent 6%), " +
        "radial-gradient(circle at 50% 50%, #c7d2fe4d 0%, transparent 15%)",
    },
  },
  {
    id: "sunset",
    label: "Sunset Gradient",
    sub: "Chuyển sắc hoàng hôn",
    base: "bg-gradient-to-b from-orange-200 via-rose-200 to-pink-200",
    patternStyle: {
      backgroundImage: "radial-gradient(circle, #ffffff99 1.2px, transparent 1.2px)",
      backgroundSize: "30px 30px",
    },
  },
  {
    id: "stars",
    label: "Night Stars",
    sub: "Bầu trời đêm lấp lánh",
    base: "bg-zinc-950",
    patternStyle: {
      backgroundImage:
        "radial-gradient(circle, #d4d4d8 0.9px, transparent 0.9px), " +
        "radial-gradient(circle, #a1a1aa 0.6px, transparent 0.6px)",
      backgroundSize: "40px 40px, 26px 26px",
      backgroundPosition: "0 0, 13px 15px",
    },
  },
];

export function getChatBackground(id: string): ChatBackground {
  return CHAT_BACKGROUNDS.find((b) => b.id === id) ?? CHAT_BACKGROUNDS[0];
}
