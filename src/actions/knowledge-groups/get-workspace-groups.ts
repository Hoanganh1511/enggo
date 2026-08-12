"use server";

import { listWorkspaceGroups } from "@/lib/api/knowledge-groups";

// Client-callable (khong revalidatePath) - dung de refresh danh sach nhom
// (kem pendingRequests) sau khi approve/reject ma khong reload ca trang.
export async function getWorkspaceGroupsAction(workspaceId: string) {
  return listWorkspaceGroups(workspaceId);
}
