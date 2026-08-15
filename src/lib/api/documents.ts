import { apiFetch } from "./client";
import type { ApiDocument, ApiDocumentSummary } from "./types";

export type DocumentInput = {
  knowledgeGroupId: string;
  title: string;
  summary?: string;
  overview?: Record<string, unknown>;
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

export function listGroupDocuments(
  groupId: string,
): Promise<ApiDocumentSummary[]> {
  return apiFetch<ApiDocumentSummary[]>(`/knowledge-groups/${groupId}/documents`);
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

// Khong nhan knowledgeGroupId - doi nhom sau khi tao chua ho tro (xem
// document.service.ts backend, tranh phuc tap dong bo postCount giua 2 nhom).
export function updateDocument(
  id: string,
  dto: Partial<Omit<DocumentInput, "knowledgeGroupId">>,
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

// "Chia se len bang tin" - tao 1 Post that trong feed kham pha (khac hoan
// toan doi visibility). Tra ve Post da tao (khong dung type chi tiet o day,
// tranh phu thuoc nguoc vao content/home-feed-mock.ts).
export function shareDocumentToFeed(id: string): Promise<unknown> {
  return apiFetch<unknown>(`/documents/${id}/share`, { method: "POST" });
}
