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
};

// Binh luan THAT cho Post thuong - path RIENG "/post-comments" (khong phai
// "/posts/:id/comments" - da bi CommentController cua CommunityPost chiem,
// xem post-comment.service.ts o backend).
export function listPostComments(postId: string): Promise<PostCommentApiShape[]> {
  return apiFetch<PostCommentApiShape[]>(`/post-comments/post/${postId}`);
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
