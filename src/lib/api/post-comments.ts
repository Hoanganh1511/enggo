import { apiFetch } from "./client";

export type PostCommentApiShape = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  likesCount: number;
  createdAt: string;
  author: {
    username: string;
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  isOwner: boolean;
  likedByMe: boolean;
  // CHI co gia tri (khong undefined) o comment GOC tra ve tu listPostComments
  // - reply (getPostCommentReplies) khong tra field nay, UI gioi han reply
  // CHI 1 cap nen khong can biet reply co con reply rieng khong.
  repliesCount?: number;
};

export type PostCommentRepliesPage = {
  items: PostCommentApiShape[];
  nextCursor: string | null;
};

// Binh luan THAT cho Post thuong - path RIENG "/post-comments" (khong phai
// "/posts/:id/comments" - da bi CommentController cua CommunityPost chiem,
// xem post-comment.service.ts o backend). CHI tra comment GOC (parentId
// null) - reply KHONG con nam san trong day nua (xem getPostCommentReplies),
// UI chi hien "Có N trả lời" roi fetch that khi bam vao.
export function listPostComments(postId: string): Promise<PostCommentApiShape[]> {
  return apiFetch<PostCommentApiShape[]>(`/post-comments/post/${postId}`);
}

export function getPostCommentReplies(
  commentId: string,
  cursor?: string,
): Promise<PostCommentRepliesPage> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<PostCommentRepliesPage>(`/post-comments/${commentId}/replies${qs}`);
}

export function createPostComment(
  postId: string,
  content: string,
  parentId?: string,
): Promise<PostCommentApiShape> {
  return apiFetch<PostCommentApiShape>(`/post-comments/post/${postId}`, {
    method: "POST",
    body: JSON.stringify({ content, parentId }),
  });
}

export function deletePostComment(commentId: string): Promise<void> {
  return apiFetch<void>(`/post-comments/${commentId}`, { method: "DELETE" });
}

export function togglePostCommentLike(
  commentId: string,
): Promise<{ liked: boolean; likesCount: number }> {
  return apiFetch<{ liked: boolean; likesCount: number }>(
    `/post-comments/${commentId}/like`,
    { method: "POST" },
  );
}
