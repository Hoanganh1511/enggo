"use server";
import { getPostCommentReplies } from "@/lib/api/post-comments";

export async function getPostCommentRepliesAction(commentId: string, cursor?: string) {
  return getPostCommentReplies(commentId, cursor);
}
