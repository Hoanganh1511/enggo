"use server";
import { listNotesForEntry, listNotesForSeries } from "@/lib/api/notes";

export async function listNotesForEntryAction(entryId: string) {
  return listNotesForEntry(entryId);
}

export async function listNotesForSeriesAction(seriesSlug: string) {
  return listNotesForSeries(seriesSlug);
}
