"use server";

import { revalidatePath } from "next/cache";
import { approveCollab } from "@/lib/api/knowledge-groups";

export async function approveCollabAction(
  groupId: string,
  collabId: string,
  username: string,
) {
  const result = await approveCollab(groupId, collabId);
  revalidatePath(`/u/${username}/workspaces`);
  return result;
}
