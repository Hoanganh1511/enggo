import { apiFetch } from "./client";
import type { ApiChecklistItem, ApiChecklistItemLog, ChecklistStatus } from "./types";

export function listChecklistItems(
  documentId: string,
): Promise<ApiChecklistItem[]> {
  return apiFetch<ApiChecklistItem[]>(`/documents/${documentId}/checklist`);
}

export function createChecklistItem(
  documentId: string,
  dto: { label: string; note?: string },
): Promise<ApiChecklistItem> {
  return apiFetch<ApiChecklistItem>(`/documents/${documentId}/checklist`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateChecklistItem(
  id: string,
  dto: { label?: string; note?: string; orderIndex?: number },
): Promise<ApiChecklistItem> {
  return apiFetch<ApiChecklistItem>(`/checklist-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function updateChecklistStatus(
  id: string,
  status: ChecklistStatus,
): Promise<ApiChecklistItem> {
  return apiFetch<ApiChecklistItem>(`/checklist-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteChecklistItem(id: string): Promise<void> {
  return apiFetch<void>(`/checklist-items/${id}`, { method: "DELETE" });
}

export function listChecklistItemLogs(
  id: string,
): Promise<ApiChecklistItemLog[]> {
  return apiFetch<ApiChecklistItemLog[]>(`/checklist-items/${id}/logs`);
}
