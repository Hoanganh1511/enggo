"use server";

import { updateObjectiveItemStatus } from "@/lib/api/objectives";
import type { ChecklistStatus } from "@/lib/api/types";

export async function updateObjectiveItemStatusAction(
  id: string,
  status: ChecklistStatus,
) {
  return updateObjectiveItemStatus(id, status);
}
