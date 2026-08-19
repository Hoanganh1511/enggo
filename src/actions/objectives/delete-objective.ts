"use server";

import { deleteObjective } from "@/lib/api/objectives";

export async function deleteObjectiveAction(id: string) {
  return deleteObjective(id);
}
