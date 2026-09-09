"use server";

import {
  getTrackingWellnessLog,
  upsertTrackingWellnessLog,
  getTrackingSleepInsight,
  type TrackingWellnessLogInput,
} from "@/lib/api/tracking";

export async function getTrackingWellnessLogAction(date: string) {
  return getTrackingWellnessLog(date);
}
export async function upsertTrackingWellnessLogAction(
  date: string,
  dto: TrackingWellnessLogInput,
) {
  return upsertTrackingWellnessLog(date, dto);
}
export async function getTrackingSleepInsightAction() {
  return getTrackingSleepInsight();
}
