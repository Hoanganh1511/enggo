import { apiFetch } from "./client";
import type { ApiCommunity, ApiCommunityMember, ApiCommunitySummary } from "./types";

export function getCommunityBySlug(slug: string): Promise<ApiCommunity> {
  return apiFetch<ApiCommunity>(`/communities/${slug}`);
}

// Danh sach community CONG KHAI cho trang "Đi cùng mọi người" - du lieu
// that 100% (khong con Series mock nua).
export function listCommunities(): Promise<ApiCommunitySummary[]> {
  return apiFetch<ApiCommunitySummary[]>(`/communities`);
}

export function createCommunity(dto: {
  name: string;
  slug: string;
  description: string;
  isPublic?: boolean;
}): Promise<{ id: string; slug: string; name: string }> {
  return apiFetch(`/communities`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function joinCommunity(
  communityId: string,
  reason?: string,
): Promise<ApiCommunityMember> {
  return apiFetch<ApiCommunityMember>(`/communities/${communityId}/join`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function leaveCommunity(communityId: string): Promise<void> {
  return apiFetch<void>(`/communities/${communityId}/join`, {
    method: "DELETE",
  });
}

export function listCommunityMembers(
  communityId: string,
  params?: { cursor?: string; limit?: number },
): Promise<ApiCommunityMember[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<ApiCommunityMember[]>(
    `/communities/${communityId}/members${qs ? `?${qs}` : ""}`,
  );
}

export function approveJoinRequest(
  communityId: string,
  memberId: string,
): Promise<ApiCommunityMember> {
  return apiFetch<ApiCommunityMember>(
    `/communities/${communityId}/members/${memberId}/approve`,
    { method: "PATCH" },
  );
}

export function rejectJoinRequest(
  communityId: string,
  memberId: string,
): Promise<ApiCommunityMember> {
  return apiFetch<ApiCommunityMember>(
    `/communities/${communityId}/members/${memberId}/reject`,
    { method: "PATCH" },
  );
}
