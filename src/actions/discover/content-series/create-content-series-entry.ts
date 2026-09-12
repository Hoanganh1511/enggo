"use server";
import { createContentSeriesEntry, type ContentSeriesEntryInput } from "@/lib/api/content-series";

export async function createContentSeriesEntryAction(
  seriesSlug: string,
  input: ContentSeriesEntryInput & { categoryId: string; title: string; contentMarkdown: string },
) {
  return createContentSeriesEntry(seriesSlug, input);
}
