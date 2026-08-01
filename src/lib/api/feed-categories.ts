import { apiFetch } from "./client";

// Phan loai bai viet theo LINH VUC NGHE NGHIEP - 2 tang, thay cho cay
// "Khám phá chủ đề" (Knowledge Worlds) o sidebar. Backend chi tra nhom co it
// nhat 1 bai trong 7 ngay gan nhat va sap nhom soi dong nhat len dau, nen
// KHONG hardcode danh sach o frontend nhu knowledge-worlds.ts truoc day.
export type FeedCategoryNode = {
  slug: string;
  name: string;
  postCount: number;
};

export type FeedCategoryGroup = FeedCategoryNode & {
  icon: string | null;
  categories: FeedCategoryNode[];
};

// Muc co dinh o cuoi cay: bai khong gan nganh nghe nao. Slug nay khong phai
// category that trong DB - backend tu dich thanh dieu kien "careerCategoryId
// is null" khi loc (xem feed-category.service.ts).
export const UNCATEGORIZED_SLUG = "chia-se-chung";

export function getFeedCategoryTree(): Promise<FeedCategoryGroup[]> {
  return apiFetch<FeedCategoryGroup[]>("/feed/categories/tree");
}
