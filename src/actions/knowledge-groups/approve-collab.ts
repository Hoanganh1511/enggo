"use server";

import { revalidatePath } from "next/cache";
import { approveCollab } from "@/lib/api/knowledge-groups";

// workspaceId optional - cac noi goi TU BEN NGOAI workspace hien tai (vd
// NotificationsPanel.tsx, duyet thang tu dropdown thong bao tren header, co
// the dang o BAT KY trang nao) co the khong can revalidate gi ca, chi can
// mutation thanh cong. `/u/${username}/workspaces` CU da khong con ton tai
// (route that la /workspace/${username}/${workspaceId}) - sua lai dung route
// hien hanh khi co du workspaceId.
export async function approveCollabAction(
  groupId: string,
  collabId: string,
  username: string,
  workspaceId?: string,
) {
  const result = await approveCollab(groupId, collabId);
  if (workspaceId) revalidatePath(`/workspace/${username}/${workspaceId}`);
  return result;
}
