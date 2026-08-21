import { apiFetch } from "./client";

export type ApiUploadResult = {
  url: string;
  size: number;
  mimeType: string;
  name: string;
};

// formData phai co field "file" (File/Blob) + "kind" ("image"|"file"|"voice") -
// xem UploadController o backend. Can AWS_S3_BUCKET/AWS_REGION cau hinh that,
// khong thi backend tra 503.
export function uploadChatAttachment(
  formData: FormData,
): Promise<ApiUploadResult> {
  return apiFetch<ApiUploadResult>("/uploads", {
    method: "POST",
    body: formData,
  });
}
