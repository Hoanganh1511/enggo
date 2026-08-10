import { apiFetch } from "./client";

export function toggleReaction(
  postId: string,
  emoji: string,
): Promise<{ emoji: string; count: number }[]> {
  return apiFetch(`/posts/${postId}/reactions`, {
    method: "POST",
    body: JSON.stringify({ emoji }),
  });
}
