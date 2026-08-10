"use server";
import { revalidatePath } from "next/cache";
import { createChannelPost } from "@/lib/api/channels";

export async function createChannelPostAction(
  channelId: string,
  slug: string,
  dto: {
    title?: string;
    content: string;
    category?: string;
    data?: Record<string, unknown>;
  },
) {
  const post = await createChannelPost(channelId, dto);
  revalidatePath(`/communities/${slug}`);
  return post;
}
