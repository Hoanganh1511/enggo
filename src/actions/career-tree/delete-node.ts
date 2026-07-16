"use server";

import { revalidatePath } from "next/cache";
import { deleteNode } from "@/lib/api/nodes";

export async function deleteNodeAction(workspaceId: string, nodeId: string) {
  await deleteNode(workspaceId, nodeId);
  revalidatePath(`/w/${workspaceId}`);
}
