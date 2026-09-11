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
// xem src/lib/api/post-comments.ts). Tu 2026-09-12: reply KHONG con tai het
// tu dau (repliesCount tu API, repliesLoaded rong den khi nguoi dung bam "Có
// N trả lời" - xem ArticleComments.tsx fetch tung 3). 2 field cuoi la STATE
// UI THUAN (khong tu API, gan/xoa truc tiep tren object trong setState) cho
// hieu ung optimistic gui/xoa - luon undefined voi comment that binh thuong.
export type ArticleComment = {
  id: string;
  author: Author;
  createdAt: string;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  isOwner: boolean;
  repliesCount: number;
  repliesLoaded: ArticleComment[];
  repliesCursor: string | null;
  repliesExpanded: boolean;
  // true = dang cho server xac nhan (comment "gia" vua bam Gui, nhap nhay
  // mo). undefined/false = binh thuong.
  pending?: boolean;
  // true = dang choi hieu ung nuoc dang truoc khi bien mat that khoi DOM.
  deleting?: boolean;
  // true = VUA duoc server xac nhan xong (choi flash 1 lan) - tu tat qua
  // onAnimationEnd, khong luu lau dai.
  justConfirmed?: boolean;
};
