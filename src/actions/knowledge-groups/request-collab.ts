"use server";

import { requestCollab } from "@/lib/api/knowledge-groups";

// Khong revalidatePath - request dang PENDING khong doi UI cua chinh nguoi
// gui (van thay "da gui yeu cau"), owner se thay qua fetch rieng khi ho vao
// quan ly nhom.
export async function requestCollabAction(groupId: string, reason?: string) {
  return requestCollab(groupId, reason);
}
