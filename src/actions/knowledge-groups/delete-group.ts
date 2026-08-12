"use server";

import { revalidatePath } from "next/cache";
import { deleteKnowledgeGroup } from "@/lib/api/knowledge-groups";

export async function deleteGroupAction(id: string, username: string) {
  await deleteKnowledgeGroup(id);
  revalidatePath(`/u/${username}/workspaces`);
}
