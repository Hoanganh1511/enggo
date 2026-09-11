"use server";
import { toggleLikePost } from "@/lib/api/posts";

export async function toggleLikePostAction(postId: string) {
  return toggleLikePost(postId);
}
