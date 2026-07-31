import { apiFetch } from "./client";
import type { Post } from "@/content/home-feed-mock";

// Response cua PostModule (career-tree-api) da khop SAN voi shape Post o
// frontend (id/kind/author/createdAt/stats + field rieng tung kind spread ra
// ngoai) - xem post.service.ts (toApiPost) - nen khong can mapper rieng o day.
export function listPosts(params?: {
  cursor?: string;
  limit?: number;
  authorUsername?: string;
  // Gia tri enum PostCategory that o backend (vd "FRONTEND") - xem
  // slugToCategoryEnum() trong category-taxonomy.ts de doi tu slug hien thi.
  category?: string;
}): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.authorUsername) query.set("authorUsername", params.authorUsername);
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();
  return apiFetch<Post[]>(`/posts${qs ? `?${qs}` : ""}`);
}

// `data` la field rieng tung kind (content/title/image/...) - shape khac
// nhau tuy kind, xem PostComposer.tsx buildPostData(). Kind truyen kebab-case
// dung nhu Post["kind"], backend tu chuyen sang enum luu DB. `category` la
// gia tri enum PostCategory (vd "FRONTEND"), optional.
export function createPost(
  kind: Post["kind"],
  data: Record<string, unknown>,
  category?: string,
): Promise<Post> {
  return apiFetch<Post>(`/posts`, {
    method: "POST",
    body: JSON.stringify({ kind, data, category }),
  });
}
