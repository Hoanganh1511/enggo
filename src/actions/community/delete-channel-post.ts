"use server";
import { revalidatePath } from "next/cache";
import { deleteCommunityPost } from "@/lib/api/channels";

export async function deleteChannelPostAction(postId: string, slug: string) {
  await deleteCommunityPost(postId);
  revalidatePath(`/communities/${slug}`);
}
