"use server";
import { getNode } from "@/lib/api/nodes";

export async function getNodeAction(workspaceId: string, nodeId: string) {
  return getNode(workspaceId, nodeId);
}
