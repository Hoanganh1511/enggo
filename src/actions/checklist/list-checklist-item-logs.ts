"use server";

import { listChecklistItemLogs } from "@/lib/api/checklist";

export async function listChecklistItemLogsAction(id: string) {
  return listChecklistItemLogs(id);
}
