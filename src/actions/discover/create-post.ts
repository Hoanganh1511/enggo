"use server";
import { createPost } from "@/lib/api/posts";
import type { Post } from "@/content/home-feed-mock";

export async function createPostAction(
  kind: Post["kind"],
  data: Record<string, unknown>,
  opts?: {
    category?: string;
    visibility?: "draft" | "public" | "limited";
    commentsEnabled?: boolean;
    likesEnabled?: boolean;
    searchable?: boolean;
  },
) {
  return createPost(kind, data, opts);
}
