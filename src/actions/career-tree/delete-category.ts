"use server";

import { revalidatePath } from "next/cache";
import { deleteCategory } from "@/lib/api/categories";

export async function deleteCategoryAction(
  workspaceId: string,
  categoryId: string,
) {
  await deleteCategory(categoryId);
  revalidatePath(`/skill-tree/${workspaceId}`);
}
