"use server";

import { createDiaryEntry, type DiaryEntryInput } from "@/lib/api/diary";

export async function createDiaryEntryAction(
  topicId: string,
  dto: DiaryEntryInput,
) {
  return createDiaryEntry(topicId, dto);
}
