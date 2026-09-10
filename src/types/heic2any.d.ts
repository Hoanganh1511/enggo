// "heic2any" khong co san @types (khong ton tai tren npm registry) - khai
// bao toi thieu du dung (chi dung 1 cho duy nhat: use-profile-image-upload.ts,
// chuyen doi anh HEIC/HEIF tu iPhone/Safari iOS sang JPEG truoc khi upload -
// xem ghi chu o do).
declare module "heic2any" {
  type Heic2AnyOptions = {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  };
  export default function heic2any(
    options: Heic2AnyOptions,
  ): Promise<Blob | Blob[]>;
}
