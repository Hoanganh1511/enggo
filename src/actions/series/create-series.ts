"use server";

import { createSeries, type CreateSeriesInput } from "@/lib/api/series";

export async function createSeriesAction(
  groupId: string,
  dto: CreateSeriesInput,
) {
  return createSeries(groupId, dto);
}
