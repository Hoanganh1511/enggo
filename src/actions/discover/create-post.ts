"use server";
import { createPost } from "@/lib/api/posts";
import type { Post } from "@/content/home-feed-mock";

export async function createPostAction(
  kind: Post["kind"],
  data: Record<string, unknown>,
  category?: string,
) {
  return createPost(kind, data, category);
}
