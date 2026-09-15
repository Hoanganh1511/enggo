"use server";
import { reorderContentSeries } from "@/lib/api/content-series";

export async function reorderContentSeriesAction(orderedIds: string[]) {
  return reorderContentSeries(orderedIds);
}
