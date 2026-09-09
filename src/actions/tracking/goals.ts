"use server";

import {
  listTrackingGoals,
  createTrackingGoal,
  updateTrackingGoal,
  deleteTrackingGoal,
  createTrackingMilestone,
  updateTrackingMilestone,
  deleteTrackingMilestone,
  createTrackingGoalStep,
  createTrackingGoalStepUnderMilestone,
  updateTrackingGoalStep,
  deleteTrackingGoalStep,
  getTrackingRealityCheck,
  upsertTrackingSettings,
  type TrackingGoalInput,
  type TrackingGoalStepInput,
  type TrackingMilestoneInput,
} from "@/lib/api/tracking";

export async function listTrackingGoalsAction() {
  return listTrackingGoals();
}
export async function createTrackingGoalAction(dto: TrackingGoalInput) {
  return createTrackingGoal(dto);
}
export async function updateTrackingGoalAction(id: string, dto: Partial<TrackingGoalInput>) {
  return updateTrackingGoal(id, dto);
}
export async function deleteTrackingGoalAction(id: string) {
  return deleteTrackingGoal(id);
}
export async function createTrackingMilestoneAction(goalId: string, dto: TrackingMilestoneInput) {
  return createTrackingMilestone(goalId, dto);
}
export async function updateTrackingMilestoneAction(
  milestoneId: string,
  dto: Partial<TrackingMilestoneInput> & { orderIndex?: number; weeklyGoalNote?: string },
) {
  return updateTrackingMilestone(milestoneId, dto);
}
export async function deleteTrackingMilestoneAction(milestoneId: string) {
  return deleteTrackingMilestone(milestoneId);
}
export async function createTrackingGoalStepAction(goalId: string, dto: TrackingGoalStepInput) {
  return createTrackingGoalStep(goalId, dto);
}
export async function createTrackingGoalStepUnderMilestoneAction(
  milestoneId: string,
  dto: TrackingGoalStepInput,
) {
  return createTrackingGoalStepUnderMilestone(milestoneId, dto);
}
export async function updateTrackingGoalStepAction(
  stepId: string,
  dto: Partial<TrackingGoalStepInput> & { done?: boolean; orderIndex?: number },
) {
  return updateTrackingGoalStep(stepId, dto);
}
export async function deleteTrackingGoalStepAction(stepId: string) {
  return deleteTrackingGoalStep(stepId);
}
export async function getTrackingRealityCheckAction() {
  return getTrackingRealityCheck();
}
export async function upsertTrackingSettingsAction(weeklyAvailableHours: number) {
  return upsertTrackingSettings(weeklyAvailableHours);
}
