"use server";

import { createDiaryTopic, type DiaryTopicInput } from "@/lib/api/diary";

export async function createDiaryTopicAction(dto: DiaryTopicInput) {
  return createDiaryTopic(dto);
}
