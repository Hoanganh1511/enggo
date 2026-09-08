"use server";

import { updateDiaryEntry, type DiaryEntryInput } from "@/lib/api/diary";

export async function updateDiaryEntryAction(
  id: string,
  dto: Partial<DiaryEntryInput>,
) {
  return updateDiaryEntry(id, dto);
}
