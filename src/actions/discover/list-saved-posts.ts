"use server";
import { listSavedPosts } from "@/lib/api/posts";

export async function listSavedPostsAction(cursor?: string) {
  return listSavedPosts(cursor);
}
