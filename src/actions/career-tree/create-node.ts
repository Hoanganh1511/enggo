"use server";

import { revalidatePath } from "next/cache";
import { createNode } from "@/lib/api/nodes";
import type { NodeKind } from "@/lib/api/types";

export async function createNodeAction(
  workspaceId: string,
  parentId: string | null,
  title: string,
  kind?: NodeKind,
) {
  const node = await createNode(workspaceId, { parentId, title, kind });
  revalidatePath(`/w/${workspaceId}`);
  return node;
}
