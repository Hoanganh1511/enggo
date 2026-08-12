"use server";

import { revalidatePath } from "next/cache";
import {
  createKnowledgeGroup,
  type KnowledgeGroupInput,
} from "@/lib/api/knowledge-groups";

export async function createGroupAction(
  workspaceId: string,
  username: string,
  dto: KnowledgeGroupInput,
) {
  const group = await createKnowledgeGroup(workspaceId, dto);
  revalidatePath(`/u/${username}/workspaces`);
  return group;
}
