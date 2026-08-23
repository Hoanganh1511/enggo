import { renderEmojiSticker } from "./sticker-render";

// ~28 sticker preset (spec: "20-30 presets") - emoji THAT ve qua canvas
// (renderEmojiSticker), khong phai anh gia tu CDN ngoai (tranh doi hoi mang/
// URL khong kiem chung duoc). Chon theo chu de nhat ky/cuoc song ca nhan
// (phu hop "Life Book") thay vi random.
const STICKER_PRESET_DEFS: { id: string; emoji: string; label: string }[] = [
  { id: "star", emoji: "⭐", label: "Ngôi sao" },
  { id: "heart", emoji: "❤️", label: "Trái tim" },
  { id: "sparkles", emoji: "✨", label: "Lấp lánh" },
  { id: "fire", emoji: "🔥", label: "Lửa" },
  { id: "sun", emoji: "☀️", label: "Mặt trời" },
  { id: "moon", emoji: "🌙", label: "Mặt trăng" },
  { id: "rainbow", emoji: "🌈", label: "Cầu vồng" },
  { id: "cloud", emoji: "☁️", label: "Mây" },
  { id: "flower", emoji: "🌸", label: "Hoa" },
  { id: "leaf", emoji: "🍃", label: "Lá" },
  { id: "tree", emoji: "🌳", label: "Cây" },
  { id: "coffee", emoji: "☕", label: "Cà phê" },
  { id: "book", emoji: "📖", label: "Sách" },
  { id: "pencil", emoji: "✏️", label: "Bút chì" },
  { id: "camera", emoji: "📷", label: "Máy ảnh" },
  { id: "music", emoji: "🎵", label: "Âm nhạc" },
  { id: "gift", emoji: "🎁", label: "Quà tặng" },
  { id: "trophy", emoji: "🏆", label: "Cúp" },
  { id: "target", emoji: "🎯", label: "Mục tiêu" },
  { id: "rocket", emoji: "🚀", label: "Tên lửa" },
  { id: "airplane", emoji: "✈️", label: "Máy bay" },
  { id: "map-pin", emoji: "📍", label: "Ghim vị trí" },
  { id: "calendar", emoji: "📅", label: "Lịch" },
  { id: "clock", emoji: "⏰", label: "Đồng hồ" },
  { id: "bulb", emoji: "💡", label: "Bóng đèn" },
  { id: "party", emoji: "🎉", label: "Ăn mừng" },
  { id: "thumbs-up", emoji: "👍", label: "Thích" },
  { id: "smile", emoji: "😊", label: "Mặt cười" },
];

export type StickerPreset = { id: string; label: string; src: string };

let cachedPresets: StickerPreset[] | null = null;

// Ve san ~28 sticker qua canvas 1 LAN DUY NHAT (cache module-level) thay vi
// moi lan mo StickerLibraryPopover lai ve lai tu dau - danh sach preset
// khong doi trong 1 phien trinh duyet.
export function getStickerPresets(): StickerPreset[] {
  if (!cachedPresets) {
    cachedPresets = STICKER_PRESET_DEFS.map((p) => ({
      id: p.id,
      label: p.label,
      src: renderEmojiSticker(p.emoji),
    }));
  }
  return cachedPresets;
}
