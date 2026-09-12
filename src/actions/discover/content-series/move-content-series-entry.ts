"use server";
import { moveContentSeriesEntry } from "@/lib/api/content-series";

export async function moveContentSeriesEntryAction(
  seriesSlug: string,
  entryId: string,
  direction: "up" | "down",
) {
  return moveContentSeriesEntry(seriesSlug, entryId, direction);
}
