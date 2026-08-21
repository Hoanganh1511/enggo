"use server";

import { votePoll } from "@/lib/api/chat";

export async function votePollAction(pollId: string, optionId: string) {
  return votePoll(pollId, optionId);
}
