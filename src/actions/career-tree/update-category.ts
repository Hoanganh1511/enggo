"use server";

import { revalidatePath } from "next/cache";
import { updateCategory } from "@/lib/api/categories";

export async function updateCategoryAction(
  workspaceId: string,
  categoryId: string,
  patch: { name?: string; icon?: string; color?: string; orderIndex?: number },
) {
  const category = await updateCategory(categoryId, patch);
  revalidatePath(`/skill-tree/${workspaceId}`);
  return category;
}
