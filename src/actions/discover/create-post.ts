"use server";
import { createPost } from "@/lib/api/posts";
import type { Post } from "@/content/home-feed-mock";

export async function createPostAction(
  kind: Post["kind"],
  data: Record<string, unknown>,
) {
  return createPost(kind, data);
}
