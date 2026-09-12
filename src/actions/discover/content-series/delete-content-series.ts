"use server";
import { deleteContentSeries } from "@/lib/api/content-series";

export async function deleteContentSeriesAction(slug: string) {
  return deleteContentSeries(slug);
}
