"use server";
import { createContentSeries, type ContentSeriesInput } from "@/lib/api/content-series";

export async function createContentSeriesAction(
  input: ContentSeriesInput & { title: string; description: string; authorName: string },
) {
  return createContentSeries(input);
}
