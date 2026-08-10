import { apiFetch } from "./client";
import type { ApiComment } from "./types";

export function listComments(
  postId: string,
  cursor?: string,
): Promise<ApiComment[]> {
  const qs = cursor ? `?cursor=${cursor}` : "";
  return apiFetch<ApiComment[]>(`/posts/${postId}/comments${qs}`);
}

export function createComment(
  postId: string,
  content: string,
  parentId?: string,
): Promise<ApiComment> {
  return apiFetch<ApiComment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentId }),
  });
}

export function deleteComment(commentId: string): Promise<void> {
  return apiFetch<void>(`/comments/${commentId}`, { method: "DELETE" });
}
