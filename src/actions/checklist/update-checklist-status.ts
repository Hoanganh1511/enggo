"use server";

import { updateChecklistStatus } from "@/lib/api/checklist";
import type { ChecklistStatus } from "@/lib/api/types";

export async function updateChecklistStatusAction(
  id: string,
  status: ChecklistStatus,
) {
  return updateChecklistStatus(id, status);
}
