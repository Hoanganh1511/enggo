"use server";

import { deleteSeries } from "@/lib/api/series";

export async function deleteSeriesAction(id: string) {
  return deleteSeries(id);
}
