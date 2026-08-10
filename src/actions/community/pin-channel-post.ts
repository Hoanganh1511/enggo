"use server";
import { revalidatePath } from "next/cache";
import { pinCommunityPost } from "@/lib/api/channels";

export async function pinChannelPostAction(postId: string, slug: string) {
  const post = await pinCommunityPost(postId);
  revalidatePath(`/communities/${slug}`);
  return post;
}
