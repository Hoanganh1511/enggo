"use server";
import { getWorkspaceCategories } from "@/lib/api/categories";

export async function getWorkspaceCategoriesAction(workspaceId: string) {
  return getWorkspaceCategories(workspaceId);
}
