"use server";
import { revalidatePath } from "next/cache";
import { unpinCommunityPost } from "@/lib/api/channels";

export async function unpinChannelPostAction(postId: string, slug: string) {
  const post = await unpinCommunityPost(postId);
  revalidatePath(`/communities/${slug}`);
  return post;
}
