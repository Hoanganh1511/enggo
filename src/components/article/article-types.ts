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
  // Uoc luong so phut doc (~200 tu/phut, tinh tu do dai content that - xem
  // toSummary() trong p/[id]/page.tsx) - optional vi khong phai noi goi
  // toSummary() nao cung can hien no (ArticleRecommendations dang hien
  // ngay thang, chi ArticleSidebarRelated moi dung field nay).
  readMinutes?: number;
};

// Binh luan bai viet - model/API that o backend (PostComment/PostCommentLike,
// xem src/lib/api/post-comments.ts) - dang NESTED (replies long ben trong,
// khop dung UI ArticleComments.tsx dang render goc->reply 1 cap), dung
// buildCommentTree() de dung tu du lieu phang API tra ve.
export type ArticleComment = {
  id: string;
  author: Author;
  createdAt: string;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  isOwner: boolean;
  replies: ArticleComment[];
};
