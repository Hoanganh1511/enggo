import type { FeedCategoryGroup } from "@/lib/api/feed-categories";

// DU LIEU TAM (theo yeu cau nguoi dung) - dung khi categoryTree THAT rong
// (backend getFeedCategoryTree() chi tra nhom co bai trong 7 ngay gan nhat,
// hien khong co bai nao du moi nen luon rong - xem page.tsx). Dung LAM
// FALLBACK, KHONG thay the vinh vien: page.tsx chi dung mang nay khi
// categoryTree that = [], nen ngay khi co bai that trong 7 ngay, du lieu
// that se tu dong thay the ma khong can sua code o day. Ten trung voi
// newest-topics-mock.ts (home-dashboard) de nhat quan giua cac khu vuc.
export const MOCK_CATEGORY_TREE: FeedCategoryGroup[] = [
  { slug: "frontend", name: "Frontend", postCount: 42, icon: null, categories: [] },
  { slug: "backend", name: "Backend", postCount: 38, icon: null, categories: [] },
  { slug: "ai-may-hoc", name: "AI & Máy học", postCount: 51, icon: null, categories: [] },
  { slug: "thiet-ke-ui-ux", name: "Thiết kế UI/UX", postCount: 27, icon: null, categories: [] },
  { slug: "nang-suat", name: "Năng suất", postCount: 33, icon: null, categories: [] },
  { slug: "kinh-doanh", name: "Kinh doanh", postCount: 24, icon: null, categories: [] },
  { slug: "mobile", name: "Mobile", postCount: 19, icon: null, categories: [] },
  { slug: "devops-cloud", name: "DevOps & Cloud", postCount: 22, icon: null, categories: [] },
  { slug: "viet-lach", name: "Viết lách", postCount: 16, icon: null, categories: [] },
  { slug: "su-nghiep", name: "Sự nghiệp", postCount: 21, icon: null, categories: [] },
];
