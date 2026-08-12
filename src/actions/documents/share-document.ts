"use server";

import { shareDocumentToFeed } from "@/lib/api/documents";

// Khong revalidatePath - giong create-post.ts (feed tu refetch qua
// lib/discover/feed-store.ts client-side), "chia se" khong doi trang bai
// viet nen khong can revalidate trang do.
export async function shareDocumentAction(id: string) {
  return shareDocumentToFeed(id);
}
