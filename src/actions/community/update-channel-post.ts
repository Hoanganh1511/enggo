"use server";
import { revalidatePath } from "next/cache";
import { updateCommunityPost } from "@/lib/api/channels";

export async function updateChannelPostAction(
  postId: string,
  slug: string,
  dto: Partial<{
    title: string;
    content: string;
    category: string;
    data: Record<string, unknown>;
  }>,
) {
  const post = await updateCommunityPost(postId, dto);
  revalidatePath(`/communities/${slug}`);
  return post;
}
