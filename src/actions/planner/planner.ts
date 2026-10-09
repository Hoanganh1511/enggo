"use server";

import {
  listPlannerItems,
  listUnscheduledPlannerItems,
  createPlannerItem,
  updatePlannerItem,
  deletePlannerItem,
  listPlannerCategoryColors,
  setPlannerCategoryColor,
  resetPlannerCategoryColor,
  getPlannerSettings,
  updatePlannerSettings,
  type CreatePlannerItemInput,
  type UpdatePlannerItemInput,
  type PlannerSettingsPatch,
} from "@/lib/api/planner";
import type { CategoryColor, PlannerCategory } from "@/lib/planner/planner-domain";

export async function listPlannerItemsAction(from: string, to: string) {
  return listPlannerItems(from, to);
}
export async function listUnscheduledPlannerItemsAction() {
  return listUnscheduledPlannerItems();
}
export async function createPlannerItemAction(dto: CreatePlannerItemInput) {
  return createPlannerItem(dto);
}
export async function updatePlannerItemAction(id: string, dto: UpdatePlannerItemInput) {
  return updatePlannerItem(id, dto);
}
export async function deletePlannerItemAction(id: string) {
  return deletePlannerItem(id);
}

export async function listPlannerCategoryColorsAction() {
  return listPlannerCategoryColors();
}
export async function setPlannerCategoryColorAction(
  category: PlannerCategory,
  color: CategoryColor,
) {
  return setPlannerCategoryColor(category, color);
}
export async function resetPlannerCategoryColorAction(category: PlannerCategory) {
  return resetPlannerCategoryColor(category);
}

export async function getPlannerSettingsAction() {
  return getPlannerSettings();
}
export async function updatePlannerSettingsAction(patch: PlannerSettingsPatch) {
  return updatePlannerSettings(patch);
}
