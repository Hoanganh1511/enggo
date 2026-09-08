"use server";

import { deleteDiaryTopic } from "@/lib/api/diary";

export async function deleteDiaryTopicAction(id: string) {
  await deleteDiaryTopic(id);
}
