import { UserFacingError } from "@/lib/api/client";
import {
  COVER_IMAGE_RATIO,
  COVER_IMAGE_RECOMMENDED_WIDTH,
} from "@/lib/validate-cover-image";

// Doc file thanh ImageBitmap 1 LAN DUY NHAT - dung chung cho ca buoc kiem
// tra kich thuoc (validateCoverImageDimensions) LAN buoc crop/resize ben
// duoi, tranh giai ma anh 2 lan (createImageBitmap + <img> rieng).
export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new UserFacingError(
      "Không đọc được ảnh này (có thể file bị hỏng). Thử chọn ảnh khác.",
    );
  }
}

// "Hệ thống tự resize/compress" - luon crop VE DUNG ty le 2:1 (cat bot canh
// dai hon, giu nguyen canh ngan) de hien thi dep/vua mat moi kich thuoc anh
// dau vao (kho khac 2:1 van qua duoc buoc kiem tra toi thieu 1200x600, chi
// khong dung ty le khuyen nghi) - roi thu nho ve toi da 1600px rong (KHONG
// bao gio phong to anh nho hon, tranh vo net). Nen JPEG chat luong 0.85 de
// nen dung luong (tieu chi "compress").
export function cropAndResizeCoverImage(bitmap: ImageBitmap): Promise<Blob> {
  const { width, height } = bitmap;
  const srcRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = width;
  let sh = height;
  if (srcRatio > COVER_IMAGE_RATIO) {
    // Anh qua "ngang" so voi 2:1 - cat bot 2 ben trai/phai, giu nguyen chieu cao.
    sw = Math.round(height * COVER_IMAGE_RATIO);
    sx = Math.round((width - sw) / 2);
  } else if (srcRatio < COVER_IMAGE_RATIO) {
    // Anh qua "dung" so voi 2:1 - cat bot tren/duoi, giu nguyen chieu rong.
    sh = Math.round(width / COVER_IMAGE_RATIO);
    sy = Math.round((height - sh) / 2);
  }

  const outWidth = Math.min(sw, COVER_IMAGE_RECOMMENDED_WIDTH);
  const outHeight = Math.round(outWidth / COVER_IMAGE_RATIO);

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new UserFacingError(
      "Trình duyệt này không hỗ trợ xử lý ảnh bìa. Thử trên trình duyệt khác (Chrome, Safari, Edge bản mới).",
    );
  }
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outWidth, outHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else
          reject(
            new UserFacingError("Không nén được ảnh bìa. Thử chọn ảnh khác."),
          );
      },
      "image/jpeg",
      0.85,
    );
  });
}
