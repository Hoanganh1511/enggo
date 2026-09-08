"use server";

import { uploadChatAttachment } from "@/lib/api/upload";

// Dung chung 1 duong upload that voi chat (POST /uploads, kind "image") -
// backend khong phan biet theo caller, chi can dung kind. Tai dung cho anh
// bia + anh chen trong Composer.tsx thay vi viet endpoint rieng.
export async function uploadPostImageAction(formData: FormData) {
  return uploadChatAttachment(formData);
}
