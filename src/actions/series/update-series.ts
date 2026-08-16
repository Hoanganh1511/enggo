"use server";

import { updateSeries } from "@/lib/api/series";

export async function updateSeriesAction(
  id: string,
  dto: { name?: string; orderIndex?: number },
) {
  return updateSeries(id, dto);
}
