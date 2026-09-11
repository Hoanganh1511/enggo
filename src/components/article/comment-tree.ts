import type { PostCommentApiShape } from "@/lib/api/post-comments";
import type { ArticleComment } from "./article-types";

// Chuyen 1 PostCommentApiShape (phang, tu API that) thanh ArticleComment -
// dung khi vua tao 1 comment/reply moi thanh cong, HOAC khi fetch 1 trang
// reply (getPostCommentReplies). repliesCount mac dinh 0 vi API tra ve field
// nay CHI o comment goc (xem toApiComment o backend) - comment moi tao/reply
// luon coi la chua co reply nao.
export function toArticleComment(c: PostCommentApiShape): ArticleComment {
  return {
    id: c.id,
    author: c.author,
    createdAt: c.createdAt,
    content: c.content,
    likesCount: c.likesCount,
    likedByMe: c.likedByMe,
    isOwner: c.isOwner,
    repliesCount: c.repliesCount ?? 0,
    repliesLoaded: [],
    repliesCursor: null,
    repliesExpanded: false,
  };
}

// listPostComments() gio CHI tra comment GOC (parentId null, xem
// post-comment.service.ts backend) - khong con can "dung tu mang phang" nua,
// chi map 1-1 qua toArticleComment. Giu ten ham (goi tu p/[id]/page.tsx) de
// khong phai doi noi goi, du ben trong don gian hon han truoc.
export function buildCommentTree(roots: PostCommentApiShape[]): ArticleComment[] {
  return roots.map(toArticleComment);
}
