"use server";

import {
  listElCourses,
  getElCourseOverview,
  getElUnitOverview,
  getElLesson,
  listElUnitExercises,
  getElCourseProgress,
  listElReviews,
  listElVocabulary,
  generateElReviewSession,
  listElMistakes,
  submitElAttempt,
} from "@/lib/api/english-learner";
import type { ElAttemptContext, ElSubmittedAnswer } from "@/lib/english-learner/domain";

export async function listElCoursesAction() {
  return listElCourses();
}
export async function getElCourseOverviewAction(courseSlug: string) {
  return getElCourseOverview(courseSlug);
}
export async function getElUnitOverviewAction(courseSlug: string, unitSlug: string) {
  return getElUnitOverview(courseSlug, unitSlug);
}
export async function getElLessonAction(
  courseSlug: string,
  unitSlug: string,
  lessonSlug: string,
) {
  return getElLesson(courseSlug, unitSlug, lessonSlug);
}
export async function listElUnitExercisesAction(courseSlug: string, unitSlug: string) {
  return listElUnitExercises(courseSlug, unitSlug);
}
export async function getElCourseProgressAction(courseSlug: string) {
  return getElCourseProgress(courseSlug);
}
export async function listElReviewsAction(courseSlug: string) {
  return listElReviews(courseSlug);
}
export async function listElVocabularyAction(courseSlug: string) {
  return listElVocabulary(courseSlug);
}
export async function generateElReviewSessionAction(reviewId: string) {
  return generateElReviewSession(reviewId);
}
export async function listElMistakesAction(limit?: number) {
  return listElMistakes(limit);
}
export async function submitElAttemptAction(input: {
  exerciseId: string;
  submittedAnswer: ElSubmittedAnswer;
  context?: ElAttemptContext;
  reviewId?: string;
  durationMs?: number;
}) {
  return submitElAttempt(input);
}
