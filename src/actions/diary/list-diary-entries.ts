"use server";

import { listDiaryEntries } from "@/lib/api/diary";

export async function listDiaryEntriesAction(topicId: string) {
  return listDiaryEntries(topicId);
}
