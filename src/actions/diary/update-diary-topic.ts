"use server";

import { updateDiaryTopic, type DiaryTopicInput } from "@/lib/api/diary";

export async function updateDiaryTopicAction(
  id: string,
  dto: Partial<DiaryTopicInput>,
) {
  return updateDiaryTopic(id, dto);
}
