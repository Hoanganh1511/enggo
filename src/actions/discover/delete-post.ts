"use server";
import { deletePost } from "@/lib/api/posts";

export async function deletePostAction(id: string) {
  return deletePost(id);
}
