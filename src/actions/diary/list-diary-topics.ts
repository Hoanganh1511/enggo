"use server";

import { listDiaryTopics } from "@/lib/api/diary";

export async function listDiaryTopicsAction() {
  return listDiaryTopics();
}
