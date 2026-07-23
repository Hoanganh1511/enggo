"use server";

import { revalidatePath } from "next/cache";
import { deleteTier } from "@/lib/api/tiers";

export async function deleteTierAction(workspaceId: string, tierId: string) {
  await deleteTier(tierId);
  revalidatePath(`/skill-tree/${workspaceId}`);
}
