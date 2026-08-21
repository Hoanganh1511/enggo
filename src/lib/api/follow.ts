import { apiFetch } from "./client";

export function followUser(username: string): Promise<void> {
  return apiFetch<void>(`/follow/${username}`, { method: "POST" });
}

export function unfollowUser(username: string): Promise<void> {
  return apiFetch<void>(`/follow/${username}`, { method: "DELETE" });
}

export function blockUser(username: string): Promise<void> {
  return apiFetch<void>(`/follow/block/${username}`, { method: "POST" });
}

export function unblockUser(username: string): Promise<void> {
  return apiFetch<void>(`/follow/block/${username}`, { method: "DELETE" });
}

export type FollowListItem = {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  isFollowing: boolean;
};

export type FollowListPage = {
  items: FollowListItem[];
  nextCursor: string | null;
};

export function getFollowing(
  username: string,
  cursor?: string,
): Promise<FollowListPage> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<FollowListPage>(`/follow/${username}/following${qs}`);
}

export function getFollowers(
  username: string,
  cursor?: string,
): Promise<FollowListPage> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<FollowListPage>(`/follow/${username}/followers${qs}`);
}

