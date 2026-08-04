"use server";
import { getPostById } from "@/lib/api/posts";

export async function getPostAction(id: string) {
  return getPostById(id);
}
