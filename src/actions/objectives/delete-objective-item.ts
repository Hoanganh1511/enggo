"use server";

import { deleteObjectiveItem } from "@/lib/api/objectives";

export async function deleteObjectiveItemAction(id: string) {
  return deleteObjectiveItem(id);
}
