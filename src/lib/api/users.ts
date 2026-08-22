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

export type UserSearchItem = {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
};

export type UserSearchPage = {
  items: UserSearchItem[];
  nextCursor: string | null;
};

// Tim theo ten hien thi/username/email/id - xem UserService.search o backend
// cho quy uoc khop (mot phan vs chinh xac). cursor+limit dung dung quy uoc
// phan trang cua site (xem follow.ts), khong dung offset/page.
export function searchUsers(
  q: string,
  cursor?: string,
  limit?: number,
): Promise<UserSearchPage> {
  const params = new URLSearchParams({ q });
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  return apiFetch<UserSearchPage>(`/users/search?${params.toString()}`);
}

// Gate cho WelcomeOnboardingModal.tsx tren /home - xem UserService.getSelf
// o backend.
export function getSelfStatus(): Promise<{ onboardedAt: string | null }> {
  return apiFetch<{ onboardedAt: string | null }>("/users/me");
}

// Hoan tat/bo qua modal chao mung - CO firstChapterTitle se tao that 1
// Workspace + 1 KnowledgeGroup dau tien, xem UserService.completeOnboarding.
export function completeOnboarding(dto: {
  goal?: string;
  firstChapterTitle?: string;
}): Promise<{ workspaceId: string | null; groupId: string | null }> {
  return apiFetch<{ workspaceId: string | null; groupId: string | null }>(
    "/users/me/onboarding",
    { method: "POST", body: JSON.stringify(dto) },
  );
}
