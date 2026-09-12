"use server";
import { deleteContentSeriesEntry } from "@/lib/api/content-series";

export async function deleteContentSeriesEntryAction(seriesSlug: string, entryId: string) {
  return deleteContentSeriesEntry(seriesSlug, entryId);
}
