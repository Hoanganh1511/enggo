import { apiFetch } from "./client";
import type { ApiChannel, ApiCommunityPost } from "./types";

// Tao KENH (khac createChannelPost o duoi - tao BAI VIET trong 1 kenh da co
// san). Bat ky thanh vien nao cung goi duoc - backend tu quyet dinh
// APPROVED ngay (neu la owner/admin) hay PENDING cho quan tri duyet.
export function createChannel(
  communityId: string,
  dto: { slug: string; name: string; description: string; group: "knowledge" | "tools" },
): Promise<ApiChannel> {
  return apiFetch<ApiChannel>(`/communities/${communityId}/channels`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function approveChannel(
  communityId: string,
  channelId: string,
): Promise<ApiChannel> {
  return apiFetch<ApiChannel>(
    `/communities/${communityId}/channels/${channelId}/approve`,
    { method: "PATCH" },
  );
}

export function rejectChannel(
  communityId: string,
  channelId: string,
): Promise<ApiChannel> {
  return apiFetch<ApiChannel>(
    `/communities/${communityId}/channels/${channelId}/reject`,
    { method: "PATCH" },
  );
}

export function listChannelPosts(
  channelId: string,
  params?: { cursor?: string; limit?: number },
): Promise<ApiCommunityPost[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<ApiCommunityPost[]>(
    `/channels/${channelId}/posts${qs ? `?${qs}` : ""}`,
  );
}

export function createChannelPost(
  channelId: string,
  dto: {
    title?: string;
    content: string;
    category?: string;
    data?: Record<string, unknown>;
  },
): Promise<ApiCommunityPost> {
  return apiFetch<ApiCommunityPost>(`/channels/${channelId}/posts`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateCommunityPost(
  postId: string,
  dto: Partial<{
    title: string;
    content: string;
    category: string;
    data: Record<string, unknown>;
  }>,
): Promise<ApiCommunityPost> {
  return apiFetch<ApiCommunityPost>(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteCommunityPost(postId: string): Promise<void> {
  return apiFetch<void>(`/posts/${postId}`, { method: "DELETE" });
}

export function pinCommunityPost(postId: string): Promise<ApiCommunityPost> {
  return apiFetch<ApiCommunityPost>(`/posts/${postId}/pin`, { method: "POST" });
}

export function unpinCommunityPost(postId: string): Promise<ApiCommunityPost> {
  return apiFetch<ApiCommunityPost>(`/posts/${postId}/pin`, {
    method: "DELETE",
  });
}
