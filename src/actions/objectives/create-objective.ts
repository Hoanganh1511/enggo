"use server";

import { createObjective } from "@/lib/api/objectives";

export async function createObjectiveAction(
  groupId: string,
  dto: { title: string; description?: string },
) {
  return createObjective(groupId, dto);
}
