import { apiFetch } from "./client";
import type { ApiNode } from "./types";

export function getWorkspaceTree(workspaceId: string): Promise<ApiNode[]> {
  return apiFetch<ApiNode[]>(`/workspaces/${workspaceId}/nodes`);
}

export function createNode(
  workspaceId: string,
  data: { parentId: string | null; title: string },
): Promise<ApiNode> {
  return apiFetch<ApiNode>(`/workspaces/${workspaceId}/nodes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateNode(
  workspaceId: string,
  nodeId: string,
  data: {
    title?: string;
    hiddenFromShare?: boolean;
    isCollapsed?: boolean;
    content?: Record<string, unknown>;
  },
): Promise<ApiNode> {
  return apiFetch<ApiNode>(`/workspaces/${workspaceId}/nodes/${nodeId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteNode(workspaceId: string, nodeId: string): Promise<void> {
  return apiFetch<void>(`/workspaces/${workspaceId}/nodes/${nodeId}`, {
    method: "DELETE",
  });
}
