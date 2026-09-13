"use server";
import { reorderContentSeriesCategories } from "@/lib/api/content-series";

export async function reorderContentSeriesCategoriesAction(seriesSlug: string, orderedIds: string[]) {
  return reorderContentSeriesCategories(seriesSlug, orderedIds);
}
