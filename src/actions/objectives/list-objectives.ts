"use server";

import { listObjectives } from "@/lib/api/objectives";

export async function listObjectivesAction(groupId: string) {
  return listObjectives(groupId);
}
