"use server";

import { deleteDiaryEntry } from "@/lib/api/diary";

export async function deleteDiaryEntryAction(id: string) {
  await deleteDiaryEntry(id);
}
