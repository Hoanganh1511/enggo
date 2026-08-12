"use server";

import { listGroupDocuments } from "@/lib/api/documents";

// Client-callable (khong revalidatePath) - dung khi WorkspaceSwitcher drill-
// down vao 1 nhom, fetch danh sach bai viet ma khong can dieu huong trang.
export async function getGroupDocumentsAction(groupId: string) {
  return listGroupDocuments(groupId);
}
