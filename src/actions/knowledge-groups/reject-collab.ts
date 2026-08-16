"use server";

import { revalidatePath } from "next/cache";
import { rejectCollab } from "@/lib/api/knowledge-groups";

// Xem comment trong approve-collab.ts (workspaceId optional + route
// revalidate da sua lai cho dung).
export async function rejectCollabAction(
  groupId: string,
  collabId: string,
  username: string,
  workspaceId?: string,
) {
  const result = await rejectCollab(groupId, collabId);
  if (workspaceId) revalidatePath(`/workspace/${username}/${workspaceId}`);
  return result;
}
