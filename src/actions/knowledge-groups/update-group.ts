"use server";

import { revalidatePath } from "next/cache";
import {
  updateKnowledgeGroup,
  type KnowledgeGroupInput,
} from "@/lib/api/knowledge-groups";

export async function updateGroupAction(
  id: string,
  username: string,
  dto: Partial<KnowledgeGroupInput>,
) {
  const group = await updateKnowledgeGroup(id, dto);
  revalidatePath(`/u/${username}/workspaces`);
  return group;
}
