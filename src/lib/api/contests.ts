import { apiFetch } from "./client";
import type { Post } from "@/content/home-feed-mock";

// "Chủ đề & Cuộc thi" - hashtag co mo ta/don vi dong hanh/giai thuong. CONTEST
// = cuoc thi co giai + han chot; TOPIC = chu de viet bai thuong truc.
export type ContestKind = "CONTEST" | "TOPIC";
export type ContestStatus = "OPEN" | "JUDGING" | "CLOSED";
export type ContestTab = "popular" | "trending" | "latest";

export type Contest = {
  id: string;
  slug: string;
  hashtag: string; // luu KHONG kem dau #, UI tu them
  title: string;
  description: string;
  kind: ContestKind;
  status: ContestStatus;
  partnerName: string | null;
  coverImageUrl: string | null;
  accent: string | null;
  prize: string | null;
  deadline: string | null;
  postCount: number;
  createdAt: string;
};

export function listContests(): Promise<Contest[]> {
  return apiFetch<Contest[]>("/contests");
}

export function getContest(slug: string): Promise<Contest> {
  return apiFetch<Contest>(`/contests/${slug}`);
}

export function getContestPosts(
  slug: string,
  tab: ContestTab = "popular",
  limit = 30,
): Promise<Post[]> {
  return apiFetch<Post[]>(`/contests/${slug}/posts?tab=${tab}&limit=${limit}`);
}

export function getContestRelatedPosts(
  slug: string,
  limit = 6,
): Promise<Post[]> {
  return apiFetch<Post[]>(`/contests/${slug}/related?limit=${limit}`);
}
