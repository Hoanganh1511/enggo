"use server";

import { revalidatePath } from "next/cache";
import { createNode } from "@/lib/api/nodes";
import type { NodeKind } from "@/lib/api/types";

export async function createNodeAction(
  workspaceId: string,
  parentId: string | null,
  title: string,
  kind?: NodeKind,
  tierId?: string,
) {
  const node = await createNode(workspaceId, {
    parentId,
    title,
    kind,
    tierId,
  });
  revalidatePath(`/w/${workspaceId}`);
  revalidatePath(`/skill-tree/${workspaceId}`);
  return node;
}
