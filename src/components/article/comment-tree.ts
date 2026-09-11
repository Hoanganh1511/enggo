import type { PostCommentApiShape } from "@/lib/api/post-comments";
import type { ArticleComment } from "./article-types";

// Chuyen 1 PostCommentApiShape (phang, tu API that) thanh ArticleComment
// (chua co replies, dung khi vua tao 1 comment/reply moi that thanh cong).
export function toArticleComment(c: PostCommentApiShape): ArticleComment {
  return {
    id: c.id,
    author: c.author,
    createdAt: c.createdAt,
    content: c.content,
    likesCount: c.likesCount,
    likedByMe: c.likedByMe,
    isOwner: c.isOwner,
    replies: [],
  };
}

// Dung mang PHANG (API that tra ve, sap theo createdAt asc) thanh cay long
// (dung UI ArticleComments.tsx dang render, goc -> reply CHI 1 cap - comment
// nao co parentId tro toi 1 comment KHAC cung la reply (tuc parentId cung
// co parentId) thi van gom vao replies cua goc gan nhat, khop dung gioi han
// UI hien tai (khong render reply-cua-reply).
export function buildCommentTree(flat: PostCommentApiShape[]): ArticleComment[] {
  const nodes = new Map<string, ArticleComment>();
  for (const c of flat) nodes.set(c.id, toArticleComment(c));

  const roots: ArticleComment[] = [];
  for (const c of flat) {
    const node = nodes.get(c.id)!;
    const parent = c.parentId ? nodes.get(c.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}
