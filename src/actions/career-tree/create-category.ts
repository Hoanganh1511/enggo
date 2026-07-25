"use server";

import { revalidatePath } from "next/cache";
import { createCategory } from "@/lib/api/categories";

export async function createCategoryAction(
  workspaceId: string,
  name: string,
  description?: string,
  icon?: string,
  color?: string,
) {
  const category = await createCategory(workspaceId, {
    name,
    description,
    icon,
    color,
  });
  revalidatePath(`/skill-tree/${workspaceId}`);
  return category;
}
