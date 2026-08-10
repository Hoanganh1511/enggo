"use server";

import { revalidatePath } from "next/cache";
import { approveJoinRequest } from "@/lib/api/community";

export async function approveJoinRequestAction(
  communityId: string,
  memberId: string,
  slug: string,
) {
  const member = await approveJoinRequest(communityId, memberId);
  revalidatePath(`/communities/${slug}`);
  return member;
}
