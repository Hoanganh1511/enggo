"use server";
import { moveContentSeriesCategory } from "@/lib/api/content-series";

export async function moveContentSeriesCategoryAction(
  seriesSlug: string,
  categoryId: string,
  direction: "up" | "down",
) {
  return moveContentSeriesCategory(seriesSlug, categoryId, direction);
}
