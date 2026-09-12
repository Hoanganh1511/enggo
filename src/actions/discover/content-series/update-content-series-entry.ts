"use server";
import { updateContentSeriesEntry, type ContentSeriesEntryInput } from "@/lib/api/content-series";

export async function updateContentSeriesEntryAction(
  seriesSlug: string,
  entryId: string,
  input: ContentSeriesEntryInput,
) {
  return updateContentSeriesEntry(seriesSlug, entryId, input);
}
