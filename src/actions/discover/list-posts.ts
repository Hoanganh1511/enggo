"use server";
import { listPosts } from "@/lib/api/posts";

export async function listPostsAction(params?: {
  cursor?: string;
  limit?: number;
  authorUsername?: string;
  category?: string[];
  kind?: string[];
  careerCategory?: string[];
  careerGroup?: string;
}) {
  return listPosts(params);
}
