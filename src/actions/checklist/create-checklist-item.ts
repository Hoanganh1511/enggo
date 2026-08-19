"use server";

import { createChecklistItem } from "@/lib/api/checklist";
import type { ChecklistGroup } from "@/lib/api/types";

export async function createChecklistItemAction(
  documentId: string,
  dto: { label: string; note?: string; group?: ChecklistGroup },
) {
  return createChecklistItem(documentId, dto);
}
