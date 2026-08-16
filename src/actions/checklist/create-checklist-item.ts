"use server";

import { createChecklistItem } from "@/lib/api/checklist";

export async function createChecklistItemAction(
  documentId: string,
  dto: { label: string; note?: string },
) {
  return createChecklistItem(documentId, dto);
}
