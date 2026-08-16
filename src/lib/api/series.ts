import { apiFetch } from "./client";
import type { ApiSeries } from "./types";

export type CreateSeriesInput = {
  name: string;
  documentIds?: string[];
};

export function createSeries(
  groupId: string,
  dto: CreateSeriesInput,
): Promise<ApiSeries> {
  return apiFetch<ApiSeries>(`/knowledge-groups/${groupId}/series`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateSeries(
  id: string,
  dto: { name?: string; orderIndex?: number },
): Promise<ApiSeries> {
  return apiFetch<ApiSeries>(`/series/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteSeries(id: string): Promise<void> {
  return apiFetch<void>(`/series/${id}`, { method: "DELETE" });
}

export function addSeriesDocuments(
  id: string,
  documentIds: string[],
): Promise<ApiSeries> {
  return apiFetch<ApiSeries>(`/series/${id}/documents`, {
    method: "POST",
    body: JSON.stringify({ documentIds }),
  });
}

export function removeSeriesDocument(
  id: string,
  documentId: string,
): Promise<void> {
  return apiFetch<void>(`/series/${id}/documents/${documentId}`, {
    method: "DELETE",
  });
}
