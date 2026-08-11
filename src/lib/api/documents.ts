import { apiFetch } from "./client";
import type { ApiDocument, ApiDocumentSummary } from "./types";

export type DocumentInput = {
  title: string;
  summary?: string;
  coverImageUrl?: string;
  content: Record<string, unknown>;
  tags?: string[];
  isPublished?: boolean;
};

export function listUserDocuments(
  username: string,
): Promise<ApiDocumentSummary[]> {
  return apiFetch<ApiDocumentSummary[]>(`/users/${username}/documents`);
}

export function getDocument(
  username: string,
  slug: string,
): Promise<ApiDocument> {
  return apiFetch<ApiDocument>(`/users/${username}/documents/${slug}`);
}

export function createDocument(dto: DocumentInput): Promise<ApiDocument> {
  return apiFetch<ApiDocument>(`/documents`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateDocument(
  id: string,
  dto: Partial<DocumentInput>,
): Promise<ApiDocument> {
  return apiFetch<ApiDocument>(`/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/documents/${id}`, { method: "DELETE" });
}

export function pinDocument(id: string): Promise<ApiDocument> {
  return apiFetch<ApiDocument>(`/documents/${id}/pin`, { method: "POST" });
}

export function unpinDocument(id: string): Promise<ApiDocument> {
  return apiFetch<ApiDocument>(`/documents/${id}/pin`, { method: "DELETE" });
}
