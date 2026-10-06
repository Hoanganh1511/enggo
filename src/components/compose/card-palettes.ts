// Card Color System - thay the viec cho user tu chon TUNG mau rieng le (icon/
// tag/border...) bang 1 BO PALETTE co san, 1 mau goc rang buoc toan bo cac
// element lien quan (yeu cau nguoi dung, kem spec day du): "Nếu bạn code tính
// năng chọn màu cho Card, mình khuyên không cho user chọn từng màu riêng lẻ.
// Hãy cho chọn một Color Theme / Palette". 7 token/palette, AP DUNG CHON LOC
// (khong phai toan bo the deu doi mau) - xem CSS card-grid-item-* trong
// post-extensions.ts/docs-prose.ts de biet token nao gan vao element nao:
// accentStrong -> icon; accent -> subtitle/category; accentSoft+accentText ->
// tag; accentBorder -> border; accentLight -> background rat nhe; accentGlow
// -> khoi trang tri goc (hover/subtle gradient). Title/description/keyInfo/
// CTA/status dot CO CHU DICH giu nguyen mau trung tinh (neutral) - KHONG theo
// palette, dung tinh than "One card = one accent family" nguoi dung nhan
// manh, tranh "rainbow UI".
export type CardPalette = {
  id: string;
  name: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentLight: string;
  accentBorder: string;
  accentText: string;
  accentGlow: string;
};

export const CARD_PALETTES: CardPalette[] = [
  // --- Modern / Professional (vivid) ---
  {
    id: "aws-orange",
    name: "AWS Orange",
    accent: "#FF9900",
    accentStrong: "#E87500",
    accentSoft: "#FFF1DB",
    accentLight: "#FFFAF2",
    accentBorder: "#FFD9A3",
    accentText: "#B85C00",
    accentGlow: "#FFF6E8",
  },
  {
    id: "azure-blue",
    name: "Azure Blue",
    accent: "#3B82F6",
    accentStrong: "#2563EB",
    accentSoft: "#EAF2FF",
    accentLight: "#F7FAFF",
    accentBorder: "#C9DDFF",
    accentText: "#1D4ED8",
    accentGlow: "#EFF6FF",
  },
  {
    id: "indigo",
    name: "Indigo",
    accent: "#6366F1",
    accentStrong: "#4F46E5",
    accentSoft: "#EEF0FF",
    accentLight: "#F8F8FF",
    accentBorder: "#D9DBFF",
    accentText: "#4338CA",
    accentGlow: "#F1F2FF",
  },
  {
    id: "violet",
    name: "Violet",
    accent: "#8B5CF6",
    accentStrong: "#7C3AED",
    accentSoft: "#F1EAFF",
    accentLight: "#FBF9FF",
    accentBorder: "#DED0FF",
    accentText: "#6D28D9",
    accentGlow: "#F6F2FF",
  },
  {
    id: "emerald",
    name: "Emerald",
    accent: "#10B981",
    accentStrong: "#059669",
    accentSoft: "#E6F8F2",
    accentLight: "#F6FFFC",
    accentBorder: "#BFECDD",
    accentText: "#047857",
    accentGlow: "#ECFDF5",
  },
  {
    id: "teal",
    name: "Teal",
    accent: "#14B8A6",
    accentStrong: "#0F766E",
    accentSoft: "#E3F8F5",
    accentLight: "#F5FFFD",
    accentBorder: "#B9EAE3",
    accentText: "#0F766E",
    accentGlow: "#ECFEFA",
  },
  {
    id: "cyan",
    name: "Cyan",
    accent: "#06B6D4",
    accentStrong: "#0891B2",
    accentSoft: "#E3F8FC",
    accentLight: "#F5FDFF",
    accentBorder: "#B7EAF2",
    accentText: "#0E7490",
    accentGlow: "#ECFEFF",
  },
  {
    id: "rose",
    name: "Rose",
    accent: "#F43F5E",
    accentStrong: "#E11D48",
    accentSoft: "#FFE9EE",
    accentLight: "#FFF8F9",
    accentBorder: "#FFC8D3",
    accentText: "#BE123C",
    accentGlow: "#FFF1F3",
  },
  {
    id: "pink",
    name: "Pink",
    accent: "#EC4899",
    accentStrong: "#DB2777",
    accentSoft: "#FCEAF4",
    accentLight: "#FFF8FC",
    accentBorder: "#F7C9DF",
    accentText: "#BE185D",
    accentGlow: "#FDF2F8",
  },
  {
    id: "amber",
    name: "Amber",
    accent: "#F59E0B",
    accentStrong: "#D97706",
    accentSoft: "#FFF4D9",
    accentLight: "#FFFCF5",
    accentBorder: "#F8D99A",
    accentText: "#B45309",
    accentGlow: "#FFFBEB",
  },
  // --- Pastel collection ---
  {
    id: "pastel-blue",
    name: "Pastel Blue",
    accent: "#93C5FD",
    accentStrong: "#3B82F6",
    accentSoft: "#E8F3FF",
    accentLight: "#F8FBFF",
    accentBorder: "#C9E1FF",
    accentText: "#2563EB",
    accentGlow: "#F0F7FF",
  },
  {
    id: "pastel-lavender",
    name: "Pastel Lavender",
    accent: "#C4B5FD",
    accentStrong: "#7C3AED",
    accentSoft: "#F1EDFF",
    accentLight: "#FCFBFF",
    accentBorder: "#DDD4FF",
    accentText: "#6D28D9",
    accentGlow: "#F7F5FF",
  },
  {
    id: "pastel-mint",
    name: "Pastel Mint",
    accent: "#86EFAC",
    accentStrong: "#16A34A",
    accentSoft: "#EAFBEF",
    accentLight: "#FAFFFB",
    accentBorder: "#C7F2D3",
    accentText: "#15803D",
    accentGlow: "#F0FDF4",
  },
  {
    id: "pastel-peach",
    name: "Pastel Peach",
    accent: "#FDBA74",
    accentStrong: "#EA580C",
    accentSoft: "#FFF0E5",
    accentLight: "#FFFCF9",
    accentBorder: "#FED7AA",
    accentText: "#C2410C",
    accentGlow: "#FFF7ED",
  },
  {
    id: "pastel-rose",
    name: "Pastel Rose",
    accent: "#FDA4AF",
    accentStrong: "#E11D48",
    accentSoft: "#FFF0F2",
    accentLight: "#FFF9FA",
    accentBorder: "#FECDD3",
    accentText: "#BE123C",
    accentGlow: "#FFF5F6",
  },
  {
    id: "pastel-lemon",
    name: "Pastel Lemon",
    accent: "#FDE68A",
    accentStrong: "#CA8A04",
    accentSoft: "#FFFBE5",
    accentLight: "#FFFDF5",
    accentBorder: "#F8E7A7",
    accentText: "#A16207",
    accentGlow: "#FEFCE8",
  },
  {
    id: "pastel-sky",
    name: "Pastel Sky",
    accent: "#7DD3FC",
    accentStrong: "#0284C7",
    accentSoft: "#E9F8FF",
    accentLight: "#F7FCFF",
    accentBorder: "#BAE6FD",
    accentText: "#0369A1",
    accentGlow: "#F0F9FF",
  },
  {
    id: "pastel-lilac",
    name: "Pastel Lilac",
    accent: "#D8B4FE",
    accentStrong: "#9333EA",
    accentSoft: "#F6EDFF",
    accentLight: "#FDFAFF",
    accentBorder: "#E9D5FF",
    accentText: "#7E22CE",
    accentGlow: "#FAF5FF",
  },
  {
    id: "pastel-sage",
    name: "Pastel Sage",
    accent: "#A7C7A0",
    accentStrong: "#4D7C4A",
    accentSoft: "#EEF6EC",
    accentLight: "#FBFDF9",
    accentBorder: "#D4E5D0",
    accentText: "#3F6B3D",
    accentGlow: "#F4F9F2",
  },
  {
    id: "pastel-sand",
    name: "Pastel Sand",
    accent: "#D6B98C",
    accentStrong: "#9A6B2F",
    accentSoft: "#F8F1E6",
    accentLight: "#FDFBF7",
    accentBorder: "#E9DCC8",
    accentText: "#855A27",
    accentGlow: "#FAF6EF",
  },
];

// Rotation co dinh cho "Auto" (khong random) - tranh tinh huong nhieu the lien
// tiep cung ngau nhien ra 1 mau (yeu cau nguoi dung: "Auto nên có một logic
// cố định, tránh Card 1 = orange, Card 2 = orange, Card 3 = orange").
export const AUTO_PALETTE_ROTATION: string[] = [
  "azure-blue",
  "violet",
  "emerald",
  "rose",
  "aws-orange",
  "cyan",
  "indigo",
];

const PALETTE_BY_ID = new Map(CARD_PALETTES.map((p) => [p.id, p] as const));

// paletteId null/undefined = "Auto" - gan theo VI TRI THAT cua the trong luoi
// (index), xoay vong qua AUTO_PALETTE_ROTATION, KHONG ngau nhien (ket qua on
// dinh qua moi lan render/luu).
export function resolveCardPalette(paletteId: string | null | undefined, index: number): CardPalette {
  if (paletteId) {
    const found = PALETTE_BY_ID.get(paletteId);
    if (found) return found;
  }
  const autoId = AUTO_PALETTE_ROTATION[index % AUTO_PALETTE_ROTATION.length];
  return PALETTE_BY_ID.get(autoId) ?? CARD_PALETTES[0];
}

// Gan toan bo 7 token thanh CSS custom properties tren 1 the - cac class
// card-grid-item-* (post-extensions.ts/docs-prose.ts) doc lai qua var(...),
// cho phep MOI the trong cung 1 CardGrid co 1 palette khac nhau ma khong can
// 7 inline style rieng le tren tung the con.
export function cardPaletteCssVars(palette: CardPalette): string {
  return (
    `--card-accent:${palette.accent};--card-accent-strong:${palette.accentStrong};` +
    `--card-accent-soft:${palette.accentSoft};--card-accent-light:${palette.accentLight};` +
    `--card-accent-border:${palette.accentBorder};--card-accent-text:${palette.accentText};` +
    `--card-accent-glow:${palette.accentGlow}`
  );
}
