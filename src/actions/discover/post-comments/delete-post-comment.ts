"use server";
import { deletePostComment } from "@/lib/api/post-comments";

export async function deletePostCommentAction(commentId: string) {
  return deletePostComment(commentId);
}
