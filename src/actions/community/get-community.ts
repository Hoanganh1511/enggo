"use server";
import { getCommunityBySlug } from "@/lib/api/community";

export async function getCommunityAction(slug: string) {
  return getCommunityBySlug(slug);
}
