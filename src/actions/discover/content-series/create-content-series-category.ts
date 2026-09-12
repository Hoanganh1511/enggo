"use server";
import {
  createContentSeriesCategory,
  type ContentSeriesCategoryInput,
} from "@/lib/api/content-series";

export async function createContentSeriesCategoryAction(
  seriesSlug: string,
  input: ContentSeriesCategoryInput & { title: string },
) {
  return createContentSeriesCategory(seriesSlug, input);
}
