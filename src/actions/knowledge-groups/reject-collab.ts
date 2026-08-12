"use server";

import { revalidatePath } from "next/cache";
import { rejectCollab } from "@/lib/api/knowledge-groups";

export async function rejectCollabAction(
  groupId: string,
  collabId: string,
  username: string,
) {
  const result = await rejectCollab(groupId, collabId);
  revalidatePath(`/u/${username}/workspaces`);
  return result;
}
