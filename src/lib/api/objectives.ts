import { apiFetch } from "./client";
import type {
  ApiObjective,
  ApiObjectiveItem,
  ApiObjectiveItemType,
  ChecklistStatus,
} from "./types";

export function listObjectives(groupId: string): Promise<ApiObjective[]> {
  return apiFetch<ApiObjective[]>(`/knowledge-groups/${groupId}/objectives`);
}

export function createObjective(
  groupId: string,
  dto: { title: string; description?: string },
): Promise<ApiObjective> {
  return apiFetch<ApiObjective>(`/knowledge-groups/${groupId}/objectives`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateObjective(
  id: string,
  dto: { title?: string; description?: string; orderIndex?: number },
): Promise<ApiObjective> {
  return apiFetch<ApiObjective>(`/objectives/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteObjective(id: string): Promise<void> {
  return apiFetch<void>(`/objectives/${id}`, { method: "DELETE" });
}

export function createObjectiveItem(
  objectiveId: string,
  dto: { type: ApiObjectiveItemType; label: string },
): Promise<ApiObjectiveItem> {
  return apiFetch<ApiObjectiveItem>(`/objectives/${objectiveId}/items`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateObjectiveItem(
  id: string,
  dto: { label?: string; note?: string; orderIndex?: number },
): Promise<ApiObjectiveItem> {
  return apiFetch<ApiObjectiveItem>(`/objective-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function updateObjectiveItemStatus(
  id: string,
  status: ChecklistStatus,
): Promise<ApiObjectiveItem> {
  return apiFetch<ApiObjectiveItem>(`/objective-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteObjectiveItem(id: string): Promise<void> {
  return apiFetch<void>(`/objective-items/${id}`, { method: "DELETE" });
}
