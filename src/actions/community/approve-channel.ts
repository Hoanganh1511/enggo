"use server";

import { revalidatePath } from "next/cache";
import { approveChannel } from "@/lib/api/channels";

export async function approveChannelAction(
  communityId: string,
  channelId: string,
  slug: string,
) {
  const channel = await approveChannel(communityId, channelId);
  revalidatePath(`/communities/${slug}`);
  return channel;
}
