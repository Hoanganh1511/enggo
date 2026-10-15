"use server";

import {
  completeEnglishSession,
  getEnglishToday,
  startEnglishSession,
  submitEnglishAnswer,
  type CompleteEnglishSessionInput,
  type SubmitEnglishAnswerInput,
} from "@/lib/api/english-learner";

export async function getEnglishTodayAction() {
  return getEnglishToday();
}

export async function startEnglishSessionAction() {
  return startEnglishSession();
}

export async function submitEnglishAnswerAction(
  sessionId: string,
  input: SubmitEnglishAnswerInput,
) {
  return submitEnglishAnswer(sessionId, input);
}

export async function completeEnglishSessionAction(
  sessionId: string,
  input: CompleteEnglishSessionInput,
) {
  return completeEnglishSession(sessionId, input);
}
