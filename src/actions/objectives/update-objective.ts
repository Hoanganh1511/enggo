"use server";

import { updateObjective } from "@/lib/api/objectives";

export async function updateObjectiveAction(
  id: string,
  dto: { title?: string; description?: string; orderIndex?: number },
) {
  return updateObjective(id, dto);
}
