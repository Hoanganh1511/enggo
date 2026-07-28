"use server";
import { getWorkspaceTree } from "@/lib/api/nodes";

export async function getWorkspaceTreeAction(workspaceId: string) {
  return getWorkspaceTree(workspaceId);
}
