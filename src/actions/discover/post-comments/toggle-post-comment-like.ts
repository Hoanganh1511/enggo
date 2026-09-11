"use server";
import { togglePostCommentLike } from "@/lib/api/post-comments";

export async function togglePostCommentLikeAction(commentId: string) {
  return togglePostCommentLike(commentId);
}
