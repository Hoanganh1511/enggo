"use server";
import { listPosts } from "@/lib/api/posts";

export async function listPostsAction(params?: {
  cursor?: string;
  limit?: number;
  authorUsername?: string;
}) {
  return listPosts(params);
}
