"use server";

import { revalidatePath } from "next/cache";
import { createTier } from "@/lib/api/tiers";

export async function createTierAction(
  workspaceId: string,
  categoryId: string,
  label: string,
  sublabel: string,
) {
  const tier = await createTier(categoryId, { label, sublabel });
  revalidatePath(`/skill-tree/${workspaceId}`);
  return tier;
}
