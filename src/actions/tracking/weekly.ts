"use server";

import {
  listTrackingTimeBlocks,
  createTrackingTimeBlock,
  updateTrackingTimeBlock,
  deleteTrackingTimeBlock,
  type TrackingTimeBlockInput,
} from "@/lib/api/tracking";

export async function listTrackingTimeBlocksAction(weekStart: string) {
  return listTrackingTimeBlocks(weekStart);
}
export async function createTrackingTimeBlockAction(dto: TrackingTimeBlockInput) {
  return createTrackingTimeBlock(dto);
}
export async function updateTrackingTimeBlockAction(
  id: string,
  dto: Partial<Omit<TrackingTimeBlockInput, "date" | "goalStepId">>,
) {
  return updateTrackingTimeBlock(id, dto);
}
export async function deleteTrackingTimeBlockAction(id: string) {
  return deleteTrackingTimeBlock(id);
}
