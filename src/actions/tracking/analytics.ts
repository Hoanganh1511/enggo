"use server";

import {
  getTrackingWeeklySummary,
  getTrackingCoachSuggestions,
  getTrackingRecommendation,
  applyTrackingBestHour,
} from "@/lib/api/tracking";

export async function getTrackingWeeklySummaryAction() {
  return getTrackingWeeklySummary();
}
export async function getTrackingCoachSuggestionsAction() {
  return getTrackingCoachSuggestions();
}
export async function getTrackingRecommendationAction() {
  return getTrackingRecommendation();
}
export async function applyTrackingBestHourAction() {
  return applyTrackingBestHour();
}
