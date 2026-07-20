"use server";

import { revalidatePath } from "next/cache";
import { updateNode } from "@/lib/api/nodes";

export async function updateNodeAction(
  workspaceId: string,
  nodeId: string,
  patch: {
    title?: string;
    goal?: string;
    hiddenFromShare?: boolean;
    isCollapsed?: boolean;
    content?: Record<string, unknown>;
  },
) {
  const node = await updateNode(workspaceId, nodeId, patch);
  revalidatePath(`/w/${workspaceId}`);
  return node;
}
