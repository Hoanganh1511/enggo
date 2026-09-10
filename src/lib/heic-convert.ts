import { UserFacingError } from "@/lib/api/client";

// Anh chup thang tu Camera app tren iPhone mac dinh la HEIC (tu iOS 11) -
// khi chon qua Safari (input type=file), file van giu nguyen dinh dang nay
// (KHONG tu chuyen JPEG nhu nhieu nguoi tuong). Backend chi cho phep jpeg/
// png/webp/gif (xem ALLOWED_MIME_TYPES o UploadService career-tree-api) nen
// bi tu choi ngay - day la nguyen nhan that cua "tải ảnh thất bại" CHI xay
// ra tren Safari iOS, khong xay ra o may desktop (anh chon o do da la jpeg/
// png san). Backend KHONG the tu giai ma HEIC de luu lai an toan (sharp/
// libheif can build native rieng, de vo tren serverless) - chuyen doi ngay
// tren trinh duyet (heic2any, WASM) truoc khi upload la cach on dinh nhat,
// khong phu thuoc backend/OS server. Dung chung cho moi noi upload anh
// (avatar/cover - use-profile-image-upload.ts, anh bia bai viet -
// Composer.tsx).
export function isHeicFile(file: File): boolean {
  return (
    /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  );
}

export async function convertHeicToJpegIfNeeded(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;
  try {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    throw new UserFacingError(
      "Không đọc được ảnh HEIC này. Vào Cài đặt > Camera > Định dạng, chọn \"Tương thích cao nhất\" rồi thử lại, hoặc chọn ảnh JPEG/PNG khác.",
    );
  }
}
