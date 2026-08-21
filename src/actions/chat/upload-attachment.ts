"use server";

import { uploadChatAttachment } from "@/lib/api/upload";

// Nhan thang FormData tu client component (Server Action ho tro File trong
// FormData qua RSC boundary) - xem lib/api/upload.ts.
export async function uploadChatAttachmentAction(formData: FormData) {
  return uploadChatAttachment(formData);
}
