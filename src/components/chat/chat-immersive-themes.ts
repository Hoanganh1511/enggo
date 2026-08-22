import {
  Car,
  Cat,
  Cloud,
  Dog,
  Dumbbell,
  Heart,
  MessageCircle,
  Mountain,
  PawPrint,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

// Thay the chat-bubble-concepts.ts/BubbleEffect.tsx/ChatBubbleConceptModal.tsx
// (huy hieu hover goc bubble) - port tu source "immersive-chat-bubbles-react"
// nguoi dung tai ve: moi theme gio la 1 KHUNG CANH nen dong (xem
// ImmersiveChatScene.tsx) LUON chay phia sau ca khung chat, khong chi hover
// tung bubble rieng le nua. Mau sac lay dung tu file main.jsx nguon.
export type ImmersiveThemeId =
  | "none"
  | "cloud"
  | "gym"
  | "cat"
  | "dog"
  | "pinky"
  | "panda"
  | "car"
  | "mountain"
  | "beach";

export type ImmersiveTheme = {
  id: ImmersiveThemeId;
  name: string;
  icon: LucideIcon;
  description: string;
  accent: string;
  accent2: string;
  bg: string;
  outgoing: string;
  // true = outgoing (bg) qua sang (cloud/panda/beach trong source goc) - can
  // chu TOI thay vi trang de doc duoc, khac quy tac "luon trang" cua source
  // goc (chi lam rieng cho Panda) - source goc de trang tren cloud/beach doc
  // rat kho nhin, day la sua loi tuong phan, khong phai bo sot khi port.
  outgoingIsLight: boolean;
};

export const IMMERSIVE_THEMES: ImmersiveTheme[] = [
  {
    id: "none",
    name: "Mặc định",
    icon: MessageCircle,
    description: "Giao diện mặc định, không hiệu ứng nền.",
    accent: "#dd700b",
    accent2: "#dd700b",
    bg: "transparent",
    outgoing: "var(--primary)",
    outgoingIsLight: false,
  },
  {
    id: "cloud",
    name: "Cloud",
    icon: Cloud,
    description: "Mây trôi nhẹ nhàng trên nền trời xanh nhạt.",
    accent: "#5BA7FF",
    accent2: "#A9D4FF",
    bg: "#EEF7FF",
    outgoing: "#DDEEFF",
    outgoingIsLight: true,
  },
  {
    id: "gym",
    name: "Gym",
    icon: Dumbbell,
    description: "Tạ lắc lư, năng lượng mạnh mẽ.",
    accent: "#9B45F4",
    accent2: "#D4AEFF",
    bg: "#F4EEFF",
    outgoing: "#8B2CF0",
    outgoingIsLight: false,
  },
  {
    id: "cat",
    name: "Cat",
    icon: Cat,
    description: "Dấu chân mèo và ánh cam ấm áp.",
    accent: "#F58B1B",
    accent2: "#FFD09A",
    bg: "#FFF5EA",
    outgoing: "#FF7900",
    outgoingIsLight: false,
  },
  {
    id: "dog",
    name: "Dog",
    icon: Dog,
    description: "Cỏ xanh tươi mát cùng dấu chân vui nhộn.",
    accent: "#35BE62",
    accent2: "#A4EAB9",
    bg: "#EEFBF1",
    outgoing: "#43C96B",
    outgoingIsLight: false,
  },
  {
    id: "pinky",
    name: "Pinky",
    icon: Heart,
    description: "Trái tim bay lơ lửng, ngọt ngào như kẹo hồng.",
    accent: "#F553A0",
    accent2: "#FFB5D6",
    bg: "#FFF0F7",
    outgoing: "#F457A4",
    outgoingIsLight: false,
  },
  {
    id: "panda",
    name: "Panda",
    icon: PawPrint,
    description: "Tre đung đưa, mực và giấy tối giản.",
    accent: "#334155",
    accent2: "#B8C6BB",
    bg: "#F1F3F2",
    outgoing: "#FFFFFF",
    outgoingIsLight: true,
  },
  {
    id: "car",
    name: "Car",
    icon: Car,
    description: "Vệt đường và tốc độ trên đường đua.",
    accent: "#F33A42",
    accent2: "#FF9B9F",
    bg: "#FFF0F1",
    outgoing: "#F5333C",
    outgoingIsLight: false,
  },
  {
    id: "mountain",
    name: "Mountain",
    icon: Mountain,
    description: "Núi non trùng điệp, mây mù bảng lảng.",
    accent: "#4285F4",
    accent2: "#9CC3FF",
    bg: "#EDF5FF",
    outgoing: "#3A82F4",
    outgoingIsLight: false,
  },
  {
    id: "beach",
    name: "Beach",
    icon: Sun,
    description: "Nắng ấm và sóng biển nhấp nhô.",
    accent: "#F4A900",
    accent2: "#FFD875",
    bg: "#FFF8E8",
    outgoing: "#FFD85C",
    outgoingIsLight: true,
  },
];

export function getImmersiveTheme(id: string): ImmersiveTheme {
  return IMMERSIVE_THEMES.find((t) => t.id === id) ?? IMMERSIVE_THEMES[0];
}

// Mau/vien bubble THEO theme - "none" giu nguyen giao dien mac dinh truoc
// khi co tinh nang nay (var(--primary) dac, khong vien), cac theme khac dung
// mau outgoing/accent2 rieng + nen ban trong suot cho tin nguoi kia (khop
// dung cach BubbleShape trong source goc).
export function getBubbleAppearance(
  theme: ImmersiveTheme,
  isMine: boolean,
): { className: string; style: CSSProperties } {
  if (theme.id === "none") {
    return isMine
      ? {
          className: "border-transparent text-white",
          style: { background: "var(--primary)" },
        }
      : {
          className: "border-slate-200 bg-white text-[#182338] shadow-[0_1px_3px_rgba(15,23,42,.08)]",
          style: {},
        };
  }
  if (isMine) {
    return {
      className: theme.outgoingIsLight ? "text-[#263449]" : "text-white",
      style: {
        background: theme.outgoing,
        border: `1px solid ${theme.accent2}66`,
      },
    };
  }
  return {
    className: "text-[#263449] backdrop-blur-sm",
    style: {
      background: "rgba(255,255,255,.84)",
      border: `1px solid ${theme.accent2}66`,
    },
  };
}
