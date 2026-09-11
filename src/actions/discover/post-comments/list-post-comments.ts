"use server";
import { listPostComments } from "@/lib/api/post-comments";

export async function listPostCommentsAction(postId: string) {
  return listPostComments(postId);
}
