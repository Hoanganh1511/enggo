"use server";

import { getGroupProgress } from "@/lib/api/knowledge-groups";

// Client-callable (khong revalidatePath) - GroupProgressWidget.tsx tu fetch
// khi group.id doi, khong can dieu huong/revalidate trang.
export async function getGroupProgressAction(groupId: string) {
  return getGroupProgress(groupId);
}
