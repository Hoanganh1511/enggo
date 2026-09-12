"use server";
import { updateContentSeries, type ContentSeriesInput } from "@/lib/api/content-series";

export async function updateContentSeriesAction(slug: string, input: ContentSeriesInput) {
  return updateContentSeries(slug, input);
}
