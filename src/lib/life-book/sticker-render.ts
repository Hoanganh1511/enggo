// Sub-phase 6.6 - thay the default-sticker.ts (1 ngoi sao duy nhat, tam thoi
// cho den khi co Sticker Library that). Van ve THAT bang canvas 2D (khong
// phai anh gia/placeholder) - chi khac la nhan 1 emoji BAT KY (dung cho ca
// thu vien preset ~28 sticker, xem sticker-presets.ts) thay vi hardcode 1
// emoji.
export function renderEmojiSticker(emoji: string, size = 96): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = `${Math.round(size * 0.72)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
  }
  return canvas.toDataURL();
}

// Nap 1 data URL vao HTMLImageElement THAT (can cho downscaleImageToDataUrl
// ben duoi doc kich thuoc goc) - Promise hoa su kien load/error cua Image
// (khong the await truc tiep 1 <img> nhu the).
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không tải được ảnh"));
    img.src = src;
  });
}

// Thu nho anh nguoi dung UPLOAD lam sticker tuy chinh (Sub-phase 6.6) xuong
// toi da `maxSize` px (giu ty le) truoc khi luu vao localStorage - sticker
// la trang tri NHO, khong can giu nguyen do phan giai anh goc (co the toi
// 5MB/anh, se vuot quota localStorage (~5-10MB/origin) rat nhanh neu luu
// nguyen ca vai anh).
export function downscaleImageToDataUrl(image: HTMLImageElement, maxSize = 200): string {
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight) || maxSize;
  const ratio = Math.min(1, maxSize / largestSide);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

// MIME type RIENG (khong phai "text/plain") cho keo-tha 1 sticker CU THE tu
// StickerLibraryPopover.tsx ra canvas - tach khoi "text/plain" (dung cho 4
// tool con lai trong CanvasToolbar.tsx, xem create-canvas-element.ts) de
// KonvaCanvas.tsx phan biet duoc 2 nguon keo-tha khac nhau trong 1 handleDrop.
export const STICKER_DND_MIME = "application/x-life-book-sticker";
