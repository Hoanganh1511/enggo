import { apiFetch } from "./client";

// "Dang xuat khoi moi thiet bi" - backend danh dau moc tokensValidAfter, moi
// token noi bo phat hanh truoc moc do bi tu choi. Khong nhan userId: backend
// lay tu token da verify de 1 nguoi khong thu hoi duoc session nguoi khac.
export function revokeAllSessions(): Promise<{ revokedAt: string }> {
  return apiFetch<{ revokedAt: string }>("/users/me/revoke-sessions", {
    method: "POST",
  });
}

export type UserProfileApiShape = {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  bio: string | null;
  coverImageUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  pronouns: string | null;
  postCount: number;
  isSelf: boolean;
  isFollowing: boolean;
};

export function getProfileByUsername(
  username: string,
): Promise<UserProfileApiShape> {
  return apiFetch<UserProfileApiShape>(`/users/${username}`);
}
