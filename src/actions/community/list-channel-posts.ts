"use server";
import { listChannelPosts } from "@/lib/api/channels";

export async function listChannelPostsAction(
  channelId: string,
  params?: { cursor?: string; limit?: number },
) {
  return listChannelPosts(channelId, params);
}
