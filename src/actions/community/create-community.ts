"use server";

import { revalidatePath } from "next/cache";
import { createCommunity } from "@/lib/api/community";

export async function createCommunityAction(dto: {
  name: string;
  slug: string;
  description: string;
  isPublic?: boolean;
}) {
  const community = await createCommunity(dto);
  revalidatePath("/communities");
  return community;
}
