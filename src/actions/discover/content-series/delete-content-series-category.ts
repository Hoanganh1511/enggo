"use server";
import { deleteContentSeriesCategory } from "@/lib/api/content-series";

export async function deleteContentSeriesCategoryAction(seriesSlug: string, categoryId: string) {
  return deleteContentSeriesCategory(seriesSlug, categoryId);
}
