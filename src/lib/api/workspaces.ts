import { apiFetch } from "./client";
import type { ApiWorkspace } from "./types";

export function getWorkspace(workspaceId: string): Promise<ApiWorkspace> {
  return apiFetch<ApiWorkspace>(`/workspaces/${workspaceId}`);
}

export function listWorkspaces(): Promise<ApiWorkspace[]> {
  return apiFetch<ApiWorkspace[]>(`/workspaces`);
}

export function createWorkspace(name: string): Promise<ApiWorkspace> {
  return apiFetch<ApiWorkspace>(`/workspaces`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
