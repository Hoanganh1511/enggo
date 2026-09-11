import { UserFacingError } from "@/lib/api/client";

// Tieu chi anh bia bai viet (yeu cau nguoi dung) - moi gia tri xuat ra rieng
// (khong hardcode trong thong bao) de dung LAI dung 1 nguon giua validate va
// resize-cover-image.ts (crop/resize theo dung ty le 2:1 nay), tranh 2 noi
// lech so lieu nhau.
export const COVER_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const COVER_IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
export const COVER_IMAGE_MIN_WIDTH = 1200;
export const COVER_IMAGE_MIN_HEIGHT = 600;
export const COVER_IMAGE_RECOMMENDED_WIDTH = 1600;
export const COVER_IMAGE_RECOMMENDED_HEIGHT = 800;
export const COVER_IMAGE_RATIO =
  COVER_IMAGE_RECOMMENDED_WIDTH / COVER_IMAGE_RECOMMENDED_HEIGHT; // 2:1

const EXT_TO_TYPE: Record<string, (typeof COVER_IMAGE_ACCEPTED_TYPES)[number]> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// `file.type` doi khi rong/sai tren 1 so trinh duyet/OS (dac biet .webp) -
// fallback doc duoi file khi MIME khong khop truoc khi ket luan tu choi,
// tranh bao sai "dinh dang khong ho tro" cho file thuc ra hop le.
function resolveType(file: File): string | null {
  if (COVER_IMAGE_ACCEPTED_TYPES.includes(file.type as (typeof COVER_IMAGE_ACCEPTED_TYPES)[number])) {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? (EXT_TO_TYPE[ext] ?? null) : null;
}

// Kiem tra dinh dang + dung luong - nem UserFacingError voi thong diep RO
// RANG, neu ro tieu chi nao khong dat (khong dung cau chung chung "tải ảnh
// thất bại"), dung tinh than da chot voi nguoi dung (xem client.ts).
export function validateCoverImageFile(file: File): void {
  if (!resolveType(file)) {
    const shown = file.type || file.name.split(".").pop()?.toUpperCase() || "không xác định";
    throw new UserFacingError(
      `Định dạng "${shown}" không được hỗ trợ cho ảnh bìa. Chỉ nhận JPG, PNG hoặc WebP.`,
    );
  }
  if (file.size > COVER_IMAGE_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = COVER_IMAGE_MAX_BYTES / (1024 * 1024);
    throw new UserFacingError(
      `Ảnh bìa nặng ${sizeMb}MB, vượt quá giới hạn ${maxMb}MB. Chọn ảnh nhẹ hơn hoặc nén lại trước khi tải lên.`,
    );
  }
}

// Kich thuoc toi thieu - GOI SAU khi da doc duoc anh that (xem
// loadImageBitmap trong resize-cover-image.ts), bao ro chinh xac kich thuoc
// anh nguoi dung vua chon vs kich thuoc toi thieu yeu cau, khong chi noi
// "ảnh quá nhỏ" chung chung.
export function validateCoverImageDimensions(width: number, height: number): void {
  if (width < COVER_IMAGE_MIN_WIDTH || height < COVER_IMAGE_MIN_HEIGHT) {
    throw new UserFacingError(
      `Ảnh ${width}×${height}px nhỏ hơn kích thước tối thiểu ${COVER_IMAGE_MIN_WIDTH}×${COVER_IMAGE_MIN_HEIGHT}px cho ảnh bìa. Chọn ảnh có độ phân giải cao hơn (khuyến nghị ${COVER_IMAGE_RECOMMENDED_WIDTH}×${COVER_IMAGE_RECOMMENDED_HEIGHT}px, tỉ lệ 2:1).`,
    );
  }
}
