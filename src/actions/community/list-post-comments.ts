"use server";
import { listComments } from "@/lib/api/comments";

export async function listPostCommentsAction(postId: string, cursor?: string) {
  return listComments(postId, cursor);
}
