"use server";
import { moveContentSeriesCategoryToParent } from "@/lib/api/content-series";

export async function moveContentSeriesCategoryToParentAction(
  seriesSlug: string,
  categoryId: string,
  newParentId: string,
) {
  return moveContentSeriesCategoryToParent(seriesSlug, categoryId, newParentId);
}
