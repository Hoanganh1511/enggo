import { apiFetch } from "./client";

// [2026-10-15] Daily English Learning Tracker - Phase 1 MVP. Xem backend
// career-tree-api/src/english-learner/english-learner.service.ts (banner
// day du) ve cac don gian hoa CHOT so voi spec goc (khong co spaced-
// repetition D+N day du, D2 dung lai 3 loai cau hoi cua D1).

export interface ApiEnglishToday {
  unit: number;
  dayType: "D1" | "D2";
  alreadyCompletedFirstAttemptToday: boolean;
  microSummary: string | null;
  assessmentCurrentStreak: number;
  learningCurrentStreak: number;
}

export interface ApiEnglishOption {
  id: string;
  text: string;
}

export interface ApiEnglishPublicQuestion {
  id: string;
  unit: number;
  conceptTags: string[];
  questionType: "RECOGNITION" | "APPLICATION" | "ERROR_DETECTION";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  stem: string;
  options: ApiEnglishOption[];
  minTimeSeconds: number;
  timeLimitSeconds: number;
  isRetentionQuestion: boolean;
}

export interface ApiEnglishSession {
  id: string;
  unit: number;
  dayType: "D1" | "D2";
  status: string;
  isFirstAttempt: boolean;
  startedAt: string;
  questions: ApiEnglishPublicQuestion[];
}

export interface ApiEnglishAnswerResult {
  isCorrect: boolean;
  belowMinTime: boolean;
  correctOptionId: string;
  explanation: string;
  distractorExplanations: Record<string, string>;
}

export interface ApiEnglishCompleteResult {
  resultStatus:
    | "NEW_KNOWLEDGE_VERIFIED"
    | "NEW_KNOWLEDGE_DEVELOPING"
    | "REVIEW_ONLY"
    | "NEEDS_REINFORCEMENT"
    | "NO_ASSESSMENT";
  flagSuspicious: boolean;
  recommendation: string;
}

export type SubmitEnglishAnswerInput = {
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds: number;
};

export type CompleteEnglishSessionInput = {
  totalTimeSeconds: number;
};

export function getEnglishToday(): Promise<ApiEnglishToday> {
  return apiFetch<ApiEnglishToday>("/english-learner/today");
}

export function startEnglishSession(): Promise<ApiEnglishSession> {
  return apiFetch<ApiEnglishSession>("/english-learner/sessions", {
    method: "POST",
  });
}

export function submitEnglishAnswer(
  sessionId: string,
  input: SubmitEnglishAnswerInput,
): Promise<ApiEnglishAnswerResult> {
  return apiFetch<ApiEnglishAnswerResult>(
    `/english-learner/sessions/${sessionId}/answers`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function completeEnglishSession(
  sessionId: string,
  input: CompleteEnglishSessionInput,
): Promise<ApiEnglishCompleteResult> {
  return apiFetch<ApiEnglishCompleteResult>(
    `/english-learner/sessions/${sessionId}/complete`,
    { method: "POST", body: JSON.stringify(input) },
  );
}
