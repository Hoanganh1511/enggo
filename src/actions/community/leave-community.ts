"use server";
import { revalidatePath } from "next/cache";
import { leaveCommunity } from "@/lib/api/community";

export async function leaveCommunityAction(communityId: string, slug: string) {
  await leaveCommunity(communityId);
  revalidatePath(`/communities/${slug}`);
}
