import { apiFetch } from "./client";
import type { Post } from "@/content/home-feed-mock";

// Response cua PostModule (career-tree-api) da khop SAN voi shape Post o
// frontend (id/kind/author/createdAt/stats + field rieng tung kind spread ra
// ngoai) - xem post.service.ts (toApiPost) - nen khong can mapper rieng o day.
export function listPosts(params?: {
  cursor?: string;
  limit?: number;
  authorUsername?: string;
  // Gia tri enum PostCategory that o backend (vd ["FRONTEND"]) - xem
  // slugToCategoryEnum() trong knowledge-worlds.ts de doi tu slug hien thi.
  // Mang co the >1 phan tu khi loc theo ca 1 Knowledge World (gop category
  // cua moi Topic con trong World do) thay vi 1 Topic cu the.
  category?: string[];
  // Kebab-case (vd ["text","image"]) - Content Type ben frontend gom nhieu
  // kind, xem getKindsByContentType() trong post-kind-meta.ts. Backend join
  // lai thanh mang khi loc (post.controller.ts).
  kind?: string[];
  // Slug nhanh nghe nghiep (xem feed-categories.ts). Chon 1 nhom cha o
  // sidebar thi truyen slug cua MOI con trong nhom - dung cach ?world= dang
  // gom topic con. Slug "chia-se-chung" = bai khong gan nganh nghe nao.
  careerCategory?: string[];
  // Slug NHOM CHA - loc theo ca nhom, backend tu mo rong ra cac nhanh con.
  careerGroup?: string;
}): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.authorUsername) query.set("authorUsername", params.authorUsername);
  if (params?.category?.length) query.set("category", params.category.join(","));
  if (params?.kind?.length) query.set("kind", params.kind.join(","));
  if (params?.careerCategory?.length)
    query.set("careerCategory", params.careerCategory.join(","));
  if (params?.careerGroup) query.set("careerGroup", params.careerGroup);
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
