"use server";
import {
  updateContentSeriesCategory,
  type ContentSeriesCategoryInput,
} from "@/lib/api/content-series";

export async function updateContentSeriesCategoryAction(
  seriesSlug: string,
  categoryId: string,
  input: ContentSeriesCategoryInput,
) {
  return updateContentSeriesCategory(seriesSlug, categoryId, input);
}
