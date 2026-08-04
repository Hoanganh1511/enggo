import type { Author } from "@/content/home-feed-mock";

// Dang rut gon cua 1 Post - dung cho ArticlePrevNextNav/ArticleRecommendations
// (chi can id/tieu de/anh/thoi gian de ve 1 dong, khong can toan bo shape
// Post). Tach rieng khoi Post de 2 component do khong phai import nguyen
// discriminated union Post chi de doc 4 truong.
export type PostSummary = {
  id: string;
  title: string;
  imageUrl?: string;
  createdAt: string;
};

// Binh luan bai viet - CHUA co model/API that o backend (post.commentsCount
// la so dem, khong co bang Comment/Reply that) nen ArticleComments.tsx khoi
// tao rong cho MOI bai that, chi cho phep them/tra loi trong pham vi state
// client cua phien xem nay (khong luu len server).
export type ArticleComment = {
  id: string;
  author: Author;
  createdAt: string;
  content: string;
  likes: number;
  replies: ArticleComment[];
};
