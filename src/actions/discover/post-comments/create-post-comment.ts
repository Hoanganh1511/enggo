"use server";
import { createPostComment } from "@/lib/api/post-comments";

export async function createPostCommentAction(
  postId: string,
  content: string,
  parentId?: string,
) {
  return createPostComment(postId, content, parentId);
}
