"use server";

import { revalidatePath } from "next/cache";
import { createNode } from "@/lib/api/nodes";

export async function createNodeAction(
  workspaceId: string,
  parentId: string | null,
  title: string,
) {
  const node = await createNode(workspaceId, { parentId, title });
  revalidatePath(`/w/${workspaceId}`);
  return node;
}
