"use server";

import {
  listTrackingTasks,
  createTrackingTask,
  updateTrackingTask,
  deleteTrackingTask,
  postponeTrackingTask,
  type TrackingTaskInput,
  type TrackingSkipReason,
} from "@/lib/api/tracking";

export async function listTrackingTasksAction(date: string) {
  return listTrackingTasks(date);
}
export async function createTrackingTaskAction(dto: TrackingTaskInput) {
  return createTrackingTask(dto);
}
export async function updateTrackingTaskAction(
  id: string,
  dto: Partial<{
    title: string;
    done: boolean;
    pinned: boolean;
    estimatedMinutes: number;
    skipReason: TrackingSkipReason;
    reviewNote: string;
  }>,
) {
  return updateTrackingTask(id, dto);
}
export async function deleteTrackingTaskAction(id: string) {
  return deleteTrackingTask(id);
}
export async function postponeTrackingTaskAction(id: string) {
  return postponeTrackingTask(id);
}
