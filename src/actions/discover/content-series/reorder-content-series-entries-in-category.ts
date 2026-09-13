"use server";
import { reorderContentSeriesEntriesInCategory } from "@/lib/api/content-series";

export async function reorderContentSeriesEntriesInCategoryAction(
  seriesSlug: string,
  categoryId: string,
  orderedIds: string[],
) {
  return reorderContentSeriesEntriesInCategory(seriesSlug, categoryId, orderedIds);
}
