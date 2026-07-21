import { apiFetch } from "./client";
import type { ApiNode, ApiNodeListItem } from "./types";

export function getWorkspaceTree(
  workspaceId: string,
): Promise<ApiNodeListItem[]> {
  return apiFetch<ApiNodeListItem[]>(`/workspaces/${workspaceId}/nodes`);
}

export function getNode(workspaceId: string, nodeId: string): Promise<ApiNode> {
  return apiFetch<ApiNode>(`/workspaces/${workspaceId}/nodes/${nodeId}`);
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
    goal?: string;
    hiddenFromShare?: boolean;
    isCollapsed?: boolean;
    content?: Record<string, unknown>;
    x?: number;
    y?: number;
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
export function resetNodeLayout(workspaceId: string): Promise<void> {
  return apiFetch<void>(`/workspaces/${workspaceId}/nodes/reset-layout`, {
    method: "PATCH",
  });
}
