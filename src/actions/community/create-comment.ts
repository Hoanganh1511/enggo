"use server";
import { createComment } from "@/lib/api/comments";

export async function createCommentAction(
  postId: string,
  content: string,
  parentId?: string,
) {
  return createComment(postId, content, parentId);
}
