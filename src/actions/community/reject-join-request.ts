"use server";

import { revalidatePath } from "next/cache";
import { rejectJoinRequest } from "@/lib/api/community";

export async function rejectJoinRequestAction(
  communityId: string,
  memberId: string,
  slug: string,
) {
  const member = await rejectJoinRequest(communityId, memberId);
  revalidatePath(`/communities/${slug}`);
  return member;
}
