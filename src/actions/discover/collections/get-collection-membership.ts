"use server";
import { getCollectionMembership } from "@/lib/api/collections";

export async function getCollectionMembershipAction(postId: string) {
  return getCollectionMembership(postId);
}
