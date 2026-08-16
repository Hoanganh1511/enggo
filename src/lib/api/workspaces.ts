import { apiFetch } from "./client";
import type {
  ApiWorkspace,
  ApiWorkspaceWithGroups,
  ApiSuggestedWorkspace,
} from "./types";

export type WorkspaceInput = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
};

export function listUserWorkspaces(
  username: string,
): Promise<ApiWorkspaceWithGroups[]> {
  return apiFetch<ApiWorkspaceWithGroups[]>(`/users/${username}/workspaces`);
}

export function createWorkspace(dto: WorkspaceInput): Promise<ApiWorkspace> {
  return apiFetch<ApiWorkspace>(`/workspaces`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateWorkspace(
  id: string,
  dto: Partial<WorkspaceInput>,
): Promise<ApiWorkspace> {
  return apiFetch<ApiWorkspace>(`/workspaces/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteWorkspace(id: string): Promise<void> {
  return apiFetch<void>(`/workspaces/${id}`, { method: "DELETE" });
}

export function listSuggestedWorkspaces(): Promise<ApiSuggestedWorkspace[]> {
  return apiFetch<ApiSuggestedWorkspace[]>(`/workspaces/suggested`);
}
