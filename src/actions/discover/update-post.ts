"use server";
import { updatePost } from "@/lib/api/posts";

export async function updatePostAction(
  id: string,
  data?: Record<string, unknown>,
  opts?: {
    category?: string;
    visibility?: "draft" | "public" | "limited";
    commentsEnabled?: boolean;
    likesEnabled?: boolean;
    searchable?: boolean;
    excerpt?: string;
    title?: string;
  },
) {
  return updatePost(id, data, opts);
}
