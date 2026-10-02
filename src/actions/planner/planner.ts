"use server";

import {
  listPlannerItems,
  createPlannerItem,
  updatePlannerItem,
  deletePlannerItem,
  type PlannerItemInput,
  type PlannerItemUpdateInput,
} from "@/lib/api/planner";

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
