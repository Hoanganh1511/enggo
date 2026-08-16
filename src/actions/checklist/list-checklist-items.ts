"use server";

import { listChecklistItems } from "@/lib/api/checklist";

export async function listChecklistItemsAction(documentId: string) {
  return listChecklistItems(documentId);
}
