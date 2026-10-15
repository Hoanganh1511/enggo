import { apiFetch } from "./client";
import type {
  ElCourseListItem,
  ElCourseOverview,
  ElUnitOverview,
  ElLessonDetail,
  ElPublicExercise,
  ElCourseProgress,
  ElMistakeItem,
  ElReviewListItem,
  ElReviewSession,
  ElSubmittedAnswer,
  ElAttemptContext,
  ElAttemptResult,
  ElVocabularyLibraryItem,
} from "@/lib/english-learner/domain";

// API English Learner - khop 1-1 voi career-tree-api/src/english-learner/.
// Toan bo route doi dang nhap (xem comment controller ben backend).

export function listElCourses(): Promise<ElCourseListItem[]> {
  return apiFetch<ElCourseListItem[]>("/english-learner/courses");
}
export function getElCourseOverview(courseSlug: string): Promise<ElCourseOverview> {
  return apiFetch<ElCourseOverview>(`/english-learner/courses/${courseSlug}`);
}
export function getElUnitOverview(
  courseSlug: string,
  unitSlug: string,
): Promise<ElUnitOverview> {
  return apiFetch<ElUnitOverview>(
    `/english-learner/courses/${courseSlug}/units/${unitSlug}`,
  );
}
export function getElLesson(
  courseSlug: string,
  unitSlug: string,
  lessonSlug: string,
): Promise<ElLessonDetail> {
  return apiFetch<ElLessonDetail>(
    `/english-learner/courses/${courseSlug}/units/${unitSlug}/lessons/${lessonSlug}`,
  );
}
export function listElUnitExercises(
  courseSlug: string,
  unitSlug: string,
): Promise<ElPublicExercise[]> {
  return apiFetch<ElPublicExercise[]>(
    `/english-learner/courses/${courseSlug}/units/${unitSlug}/exercises`,
  );
}
export function getElCourseProgress(courseSlug: string): Promise<ElCourseProgress> {
  return apiFetch<ElCourseProgress>(`/english-learner/courses/${courseSlug}/progress`);
}
export function listElReviews(courseSlug: string): Promise<ElReviewListItem[]> {
  return apiFetch<ElReviewListItem[]>(`/english-learner/courses/${courseSlug}/reviews`);
}
export function listElVocabulary(courseSlug: string): Promise<ElVocabularyLibraryItem[]> {
  return apiFetch<ElVocabularyLibraryItem[]>(`/english-learner/courses/${courseSlug}/vocabulary`);
}
export function generateElReviewSession(reviewId: string): Promise<ElReviewSession> {
  return apiFetch<ElReviewSession>(`/english-learner/reviews/${reviewId}/session`, {
    method: "POST",
  });
}
export function listElMistakes(limit?: number): Promise<ElMistakeItem[]> {
  const qs = limit ? `?limit=${limit}` : "";
  return apiFetch<ElMistakeItem[]>(`/english-learner/mistakes${qs}`);
}
export function submitElAttempt(input: {
  exerciseId: string;
  submittedAnswer: ElSubmittedAnswer;
  context?: ElAttemptContext;
  reviewId?: string;
  durationMs?: number;
}): Promise<ElAttemptResult> {
  return apiFetch<ElAttemptResult>("/english-learner/attempts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
