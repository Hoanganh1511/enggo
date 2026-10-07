// "Good Life — Life Management System" (spec day du nguoi dung gui 2026-10-06)
// - 4 Type DUY NHAT cua he thong (section 2): Action/Event/Habit/Reflection.
// KHONG them Deadline/Focus/Priority/Status/Project/Area/Milestone/Tag/
// Recurrence thanh Type - chung la METADATA (section 23), xem comment
// PlannerShell.tsx noi dung field nay.

export type LifeItemType = "ACTION" | "EVENT" | "HABIT" | "REFLECTION";

export type LifeItemTypeConfig = {
  id: LifeItemType;
  // "Action" / "Event" / "Habit" / "Reflection".
  label: string;
  // "DO" / "ATTEND" / "REPEAT" / "REFLECT" (section 1).
  verb: string;
  // "Something to do" ... (dong phu luc chon Type o Create flow, section 18).
  subtitle: string;
  // "I need to do this." (mental model, section 3-6).
  mentalModel: string;
  // Icon rieng theo Type (section 4/5/6/19: "◇"/"↻"/"✦" - Action dung
  // checkbox ○/✓ THAT thay vi 1 icon tinh, xem hasCheckbox).
  icon: string;
  hasCheckbox: boolean;
  defaultPaletteId: string;
};

export const LIFE_ITEM_TYPES: LifeItemTypeConfig[] = [
  {
    id: "ACTION",
    label: "Action",
    verb: "DO",
    subtitle: "Something to do",
    mentalModel: "I need to do this.",
    icon: "✓",
    hasCheckbox: true,
    defaultPaletteId: "blue",
  },
  {
    id: "EVENT",
    label: "Event",
    verb: "ATTEND",
    subtitle: "Something happening",
    mentalModel: "I need to be there.",
    icon: "◇",
    hasCheckbox: false,
    defaultPaletteId: "lavender",
  },
  {
    id: "HABIT",
    label: "Habit",
    verb: "REPEAT",
    subtitle: "Something to repeat",
    mentalModel: "I want to keep doing this.",
    icon: "↻",
    hasCheckbox: false,
    defaultPaletteId: "sage",
  },
  {
    id: "REFLECTION",
    label: "Reflection",
    verb: "REFLECT",
    subtitle: "Something to reflect",
    mentalModel: "I want to understand what happened and what matters next.",
    icon: "✦",
    hasCheckbox: false,
    defaultPaletteId: "sand",
  },
];

const LIFE_ITEM_TYPE_BY_ID = new Map(LIFE_ITEM_TYPES.map((t) => [t.id, t] as const));
export function getLifeItemTypeConfig(type: LifeItemType): LifeItemTypeConfig {
  return LIFE_ITEM_TYPE_BY_ID.get(type) ?? LIFE_ITEM_TYPES[0];
}

// Cung 1 hinh dang token voi CardPalette (card-palettes.ts, dung chung "ngon
// ngu" the hien mau trong toan app) - accent/accentStrong/accentSoft/
// accentLight(=background)/accentBorder/accentText.
export type LifeItemPalette = {
  id: string;
  name: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentLight: string;
  accentBorder: string;
  accentText: string;
};

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}
function tint(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => c + (255 - c) * amount;
  return rgbToHex([mix(r), mix(g), mix(b)]);
}
function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => c * (1 - amount);
  return rgbToHex([mix(r), mix(g), mix(b)]);
}
// Ty le hieu chinh TU chinh 4 bo mau MAC DINH nguoi dung dua hex chinh xac
// (section 7) - suy nguoc ra "cong thuc" chung (accent=tint 53%, soft=tint
// 90%, background=tint 97%, border=tint 78%, text=shade 21%), dung CONG THUC
// nay de sinh 10 bo mau MO RONG con lai (section 22) tu 1 mau "strong" goc
// DUY NHAT moi bo, thay vi phai tu tay chon 60 hex rieng le (de lech tong).
function derivePalette(id: string, name: string, strong: string): LifeItemPalette {
  return {
    id,
    name,
    accent: tint(strong, 0.53),
    accentStrong: strong,
    accentSoft: tint(strong, 0.9),
    accentLight: tint(strong, 0.97),
    accentBorder: tint(strong, 0.78),
    accentText: shade(strong, 0.21),
  };
}

// 4 bo mau MAC DINH - hex CHINH XAC tung ky tu nguoi dung dua (section 7),
// KHONG di qua derivePalette() (giu dung spec tuyet doi cho 4 bo nay).
const DEFAULT_PALETTES: LifeItemPalette[] = [
  {
    id: "blue",
    name: "Pastel Blue",
    accent: "#A9C9E8",
    accentStrong: "#4F8CC9",
    accentSoft: "#EAF3FB",
    accentLight: "#F8FBFE",
    accentBorder: "#D5E6F4",
    accentText: "#3F6F9F",
  },
  {
    id: "lavender",
    name: "Pastel Lavender",
    accent: "#C3B5D9",
    accentStrong: "#8066A8",
    accentSoft: "#F1EDF7",
    accentLight: "#FBFAFD",
    accentBorder: "#E3DAED",
    accentText: "#69528C",
  },
  {
    id: "sage",
    name: "Pastel Sage",
    accent: "#AFCDBF",
    accentStrong: "#5E967C",
    accentSoft: "#EDF6F1",
    accentLight: "#FAFDFB",
    accentBorder: "#D8E9DF",
    accentText: "#4E7E69",
  },
  {
    id: "sand",
    name: "Pastel Sand",
    accent: "#E1CE9A",
    accentStrong: "#A88735",
    accentSoft: "#FAF5E7",
    accentLight: "#FFFDF8",
    accentBorder: "#EDE2C2",
    accentText: "#8A6E2C",
  },
];

// [2026-10-06] 10 bo mau MO RONG (section 22: "Ngoài 4 màu semantic mặc
// định, user có thể chọn") - yeu cau nguoi dung: "Cái bảng màu này tự giảm
// màu làm màu nền kết hợp với logic cơ mà" - dung LAI DUNG 10 hex CHINH
// nguoi dung da dua truoc do (bang "Nhóm/Màu gần đúng/HEX tham khảo" - truoc
// day dung lam CATEGORY_BY_COLOR cua Planner, nay tai dung lam goc cho
// derivePalette()) THAY VI 10 mau tu nghi truoc do - dua qua CUNG 1 "logic"
// derivePalette() (tint/shade tu 1 mau goc DUY NHAT) de tu dong sinh ca
// accent/soft/background/border/text, dam bao dung mau nguoi dung chon LAN
// day la mau "strong" (goc, đậm nhất) cua tung family, KHONG PHAI mau da
// giam dam con lai (pastel) - id rieng de KHONG trung voi 4 mau mac dinh o
// tren (Lavender/Sage da la ten mac dinh, o day gan them hau to "-dusty" du
// TEN hien thi van giu dung chu "Lavender"/"Sage" nguoi dung dat).
const EXTENDED_PALETTES: LifeItemPalette[] = [
  derivePalette("cyan-sky", "Cyan / Sky", "#8DBFCB"),
  derivePalette("powder-blue", "Powder Blue", "#B4C5D2"),
  derivePalette("lavender-dusty", "Lavender", "#ACB0CB"),
  derivePalette("soft-purple", "Soft Purple", "#BDB5C9"),
  derivePalette("dusty-pink", "Dusty Pink", "#D7B0B1"),
  derivePalette("soft-peach", "Soft Peach", "#D8B49C"),
  derivePalette("sage-dusty", "Sage", "#A9C0B6"),
  derivePalette("muted-yellow", "Muted Yellow", "#D7C58E"),
  // [2026-10-06] Warm White la 1 TRUONG HOP DAC BIET trong 10 mau tren - cac
  // row khac deu la 1 mau "dam vua" ma nguoi dung mo ta (vd "xanh cyan nhạt")
  // dung LAM GOC (accentStrong) roi derivePalette() TINT SANG NHAT HON de ra
  // accent/soft/background. Rieng "Warm White" (#F4F1EB) nguoi dung TU GOI
  // THANG la "nền trắng ấm" - tuc hex nay von da dung y lam BACKGROUND (mau
  // NHAT NHAT), khong phai mau GOC. Neu dua thang hex nay vao derivePalette()
  // nhu 13 mau con lai, accentStrong se TRUNG chinh no (gan trang tuyet
  // doi) - vo hieu luc vai tro "icon/checkbox/active state can du tuong
  // phan" cua token do (xem comment derivePalette() ve nguyen tac Pastel
  // collection: "giữ accentStrong đủ đậm để text/icon vẫn có contrast").
  // Sua: derivePalette() tu 1 mau GOC đậm HON (shade 55% tu chinh hex do -
  // 1 xam am da trung tinh, cung "than" voi #F4F1EB) de accentStrong that
  // su nhin thay duoc, SAU DO ghi de accentLight = DUNG hex nguoi dung dua
  // (dam bao nen the van la "nền trắng ấm" chinh xac tung ky tu).
  { ...derivePalette("warm-white", "Warm White", shade("#F4F1EB", 0.55)), accentLight: "#F4F1EB" },
  derivePalette("cool-gray", "Cool Gray", "#B4BEC5"),
];

export const LIFE_ITEM_PALETTES: LifeItemPalette[] = [...DEFAULT_PALETTES, ...EXTENDED_PALETTES];
const PALETTE_BY_ID = new Map(LIFE_ITEM_PALETTES.map((p) => [p.id, p] as const));

// userOverrides: tu PlannerTypeColor (backend, section 21 "User customization")
// - map { [LifeItemType]: paletteId }, vang mat = dung defaultPaletteId cua
// chinh Type do.
export function resolveLifeItemPalette(
  type: LifeItemType,
  userOverrides?: Partial<Record<LifeItemType, string>>,
): LifeItemPalette {
  const cfg = getLifeItemTypeConfig(type);
  const paletteId = userOverrides?.[type] ?? cfg.defaultPaletteId;
  return PALETTE_BY_ID.get(paletteId) ?? PALETTE_BY_ID.get(cfg.defaultPaletteId)!;
}

export function lifeItemPaletteCssVars(palette: LifeItemPalette): Record<string, string> {
  return {
    "--life-accent": palette.accent,
    "--life-accent-strong": palette.accentStrong,
    "--life-accent-soft": palette.accentSoft,
    "--life-accent-light": palette.accentLight,
    "--life-accent-border": palette.accentBorder,
    "--life-accent-text": palette.accentText,
  };
}

// Priority - semantic RIENG, KHONG dung mau Type (section 9: "Priority
// không dùng màu Type. Chỉ xuất hiện ở dot/badge/small indicator").
export type LifeItemPriority = "HIGH" | "MEDIUM" | "LOW";
export const PRIORITY_CONFIG: Record<LifeItemPriority, { label: string; color: string }> = {
  HIGH: { label: "High", color: "#ef4444" },
  MEDIUM: { label: "Medium", color: "#eab308" },
  LOW: { label: "Low", color: "#9ca3af" },
};

// Status - cung semantic RIENG (section 10), danh sach goi y (tu do go them,
// khong gioi han cung 1 bang nhu Priority/Type).
export const STATUS_SUGGESTIONS = [
  "Inbox",
  "Next Action",
  "In Progress",
  "Waiting For",
  "Someday / Maybe",
  "Done",
];

// Field RIENG theo Type (section 4-6, 18) - luu trong PlannerItem.metadata
// (Json, 1 cot DUY NHAT ben backend) thay vi 4 bang rieng. Moi Type co 1
// kieu TypeScript RIENG o day de UI doc/ghi an toan (khong cast `any` rai
// rac) - Action KHONG can metadata gi them (het field da nam o cap chung:
// title/date/time/duration/priority/area/project/tags/deadline).
export type EventMetadata = {
  location?: string;
  participants?: string;
  meetingUrl?: string;
  reminderMinutesBefore?: number;
};
export type HabitMetadata = {
  frequencyPerWeek?: number;
  preferredDays?: string[]; // "MON".."SUN"
  preferredTime?: number; // phut tinh tu 0h, cung don vi voi scheduledMinute
  target?: string;
};
export type ReflectionPrompt = { label: string; answer: string };
export type ReflectionMetadata = {
  prompts?: ReflectionPrompt[];
};

export const DEFAULT_REFLECTION_PROMPTS: ReflectionPrompt[] = [
  { label: "What went well?", answer: "" },
  { label: "What did I learn?", answer: "" },
  { label: "What should I improve?", answer: "" },
  { label: "What matters next?", answer: "" },
];

// [2026-10-07] "Cảnh báo nhắc nhở" (reminder) - yeu cau nguoi dung trong
// popover "Chi tiết sự kiện": "Không có, nhắc vào lúc diễn ra, trước
// 5/10/15/30/1h/2h/1d/2d/1week". Luu trong `item.metadata.reminderMinutesBefore`
// (field DA CO SAN tren EventMetadata, nay dung CHUNG cho MOI Type - khong
// can migration backend vi `metadata` von la Json? tu do). null = "Không
// có"; 0 = "nhắc vào lúc diễn ra"; con lai = so PHUT truoc gio bat dau.
export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Không có" },
  { value: 0, label: "Nhắc vào lúc diễn ra" },
  { value: 5, label: "Trước 5 phút" },
  { value: 10, label: "Trước 10 phút" },
  { value: 15, label: "Trước 15 phút" },
  { value: 30, label: "Trước 30 phút" },
  { value: 60, label: "Trước 1 giờ" },
  { value: 120, label: "Trước 2 giờ" },
  { value: 1440, label: "Trước 1 ngày" },
  { value: 2880, label: "Trước 2 ngày" },
  { value: 10080, label: "Trước 1 tuần" },
];

export const WEEKDAY_SHORT_IDS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export const WEEKDAY_SHORT_LABELS: Record<(typeof WEEKDAY_SHORT_IDS)[number], string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};
