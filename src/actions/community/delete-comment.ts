"use server";
import { deleteComment } from "@/lib/api/comments";

export async function deleteCommentAction(commentId: string) {
  return deleteComment(commentId);
}
