"use server";

import { revalidatePath } from "next/cache";
import { updateTier } from "@/lib/api/tiers";

export async function updateTierAction(
  workspaceId: string,
  tierId: string,
  patch: { label?: string; sublabel?: string; orderIndex?: number },
) {
  const tier = await updateTier(tierId, patch);
  revalidatePath(`/skill-tree/${workspaceId}`);
  return tier;
}
