"use server";
import { toggleSavePost } from "@/lib/api/posts";

export async function toggleSavePostAction(postId: string) {
  return toggleSavePost(postId);
}
