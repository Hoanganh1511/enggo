"use server";

import { revalidatePath } from "next/cache";
import { createChannel } from "@/lib/api/channels";

export async function createChannelAction(
  communityId: string,
  slug: string,
  dto: {
    slug: string;
    name: string;
    description: string;
    group: "knowledge" | "tools";
  },
) {
  const channel = await createChannel(communityId, dto);
  revalidatePath(`/communities/${slug}`);
  return channel;
}
