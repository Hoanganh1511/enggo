"use server";

import { deleteChecklistItem } from "@/lib/api/checklist";

export async function deleteChecklistItemAction(id: string) {
  return deleteChecklistItem(id);
}
