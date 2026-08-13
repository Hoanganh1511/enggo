"use server";

import { getDocument } from "@/lib/api/documents";

// Client-callable (khong revalidatePath) - dung khi WorkspaceDetail mo 1 bai
// viet TRONG trang (khong dieu huong sang /u/[username]/workspaces/[slug]),
// can ban ĐẦY ĐỦ (co content) trong khi getGroupDocumentsAction chi tra ve
// ban rut gon (ApiDocumentSummary, khong co content).
export async function getDocumentAction(username: string, slug: string) {
  return getDocument(username, slug);
}
