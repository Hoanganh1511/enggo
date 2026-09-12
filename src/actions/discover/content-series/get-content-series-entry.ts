"use server";
import { getContentSeriesEntry } from "@/lib/api/content-series";

export async function getContentSeriesEntryAction(slug: string, entrySlug: string) {
  return getContentSeriesEntry(slug, entrySlug);
}
