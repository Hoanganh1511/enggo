"use server";

import { revalidatePath } from "next/cache";
import { rejectChannel } from "@/lib/api/channels";

export async function rejectChannelAction(
  communityId: string,
  channelId: string,
  slug: string,
) {
  const channel = await rejectChannel(communityId, channelId);
  revalidatePath(`/communities/${slug}`);
  return channel;
}
