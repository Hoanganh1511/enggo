"use server";
import { revalidatePath } from "next/cache";
import { joinCommunity } from "@/lib/api/community";

export async function joinCommunityAction(
  communityId: string,
  slug: string,
  reason?: string,
) {
  const member = await joinCommunity(communityId, reason);
  revalidatePath(`/communities/${slug}`);
  return member;
}
