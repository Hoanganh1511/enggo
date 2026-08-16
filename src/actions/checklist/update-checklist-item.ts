"use server";

import { updateChecklistItem } from "@/lib/api/checklist";

export async function updateChecklistItemAction(
  id: string,
  dto: { label?: string; note?: string; orderIndex?: number },
) {
  return updateChecklistItem(id, dto);
}
