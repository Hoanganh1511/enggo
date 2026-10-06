"use server";

import {
  listPlannerItems,
  createPlannerItem,
  updatePlannerItem,
  deletePlannerItem,
  listPlannerTypeColors,
  setPlannerTypeColor,
  resetPlannerTypeColor,
  type PlannerItemInput,
  type PlannerItemUpdateInput,
} from "@/lib/api/planner";
import type { LifeItemType } from "@/lib/planner/life-item-types";

export async function listPlannerItemsAction(from: string, to: string) {
  return listPlannerItems(from, to);
}
export async function createPlannerItemAction(dto: PlannerItemInput) {
  return createPlannerItem(dto);
}
export async function updatePlannerItemAction(id: string, dto: PlannerItemUpdateInput) {
  return updatePlannerItem(id, dto);
}
export async function deletePlannerItemAction(id: string) {
  return deletePlannerItem(id);
}

export async function listPlannerTypeColorsAction() {
  return listPlannerTypeColors();
}
export async function setPlannerTypeColorAction(type: LifeItemType, paletteId: string) {
  return setPlannerTypeColor(type, paletteId);
}
export async function resetPlannerTypeColorAction(type: LifeItemType) {
  return resetPlannerTypeColor(type);
}
