"use server";

import { createObjectiveItem } from "@/lib/api/objectives";
import type { ApiObjectiveItemType } from "@/lib/api/types";

export async function createObjectiveItemAction(
  objectiveId: string,
  dto: { type: ApiObjectiveItemType; label: string },
) {
  return createObjectiveItem(objectiveId, dto);
}
