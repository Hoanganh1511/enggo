"use server";

import { updateObjectiveItem } from "@/lib/api/objectives";

export async function updateObjectiveItemAction(
  id: string,
  dto: { label?: string; note?: string; orderIndex?: number },
) {
  return updateObjectiveItem(id, dto);
}
