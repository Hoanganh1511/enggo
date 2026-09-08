import type { Post } from "@/content/home-feed-mock";
import { getPostTitle, getPostImageUrl } from "@/components/discover/home-feed/post-display";
import { getPostContentText } from "./article-content";
import { categoryEnumToSlug } from "./knowledge-worlds";
import { UNCATEGORIZED_SLUG } from "@/lib/api/feed-categories";

// 1 hinh dang PHANG, dung chung cho moi kind - noi tieu thu (card/grid) chi
// lam viec voi shape nay, khong con phai tu suy "content" in post moi lan can
// tieu de/mo ta/anh (truoc day lap lai o nhieu component, moi kind moi them
// vao co nguy co quen 1 cho - xem getPostTitle/getPostContentText/
// getPostImageUrl, 3 ham nay da tung phai tu xu ly rieng tung kind, gio gom
// lai 1 lan duy nhat o day).
export type NormalizedPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string | undefined;
  categorySlug: string;
  author: { name: string; username: string; avatarUrl: string; verified: boolean };
  createdAt: string;
  commentCount: number;
  likeCount: number;
};

export function normalizePost(post: Post): NormalizedPost {
  return {
    id: post.id,
    title: getPostTitle(post),
    excerpt: getPostContentText(post),
    image: getPostImageUrl(post),
    categorySlug: post.category ? categoryEnumToSlug(post.category) : UNCATEGORIZED_SLUG,
    author: {
      name: post.author.name,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
      verified: post.author.verified,
    },
    createdAt: post.createdAt,
    commentCount: post.stats.comments,
    likeCount: post.stats.likes,
  };
}
