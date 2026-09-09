"use server";

import {
  listTrackingEnergyCheckins,
  createTrackingEnergyCheckin,
  getTrackingBestHour,
  type TrackingEnergyCheckinInput,
} from "@/lib/api/tracking";

export async function listTrackingEnergyCheckinsAction(from?: string, to?: string) {
  return listTrackingEnergyCheckins(from, to);
}
export async function createTrackingEnergyCheckinAction(dto: TrackingEnergyCheckinInput) {
  return createTrackingEnergyCheckin(dto);
}
export async function getTrackingBestHourAction() {
  return getTrackingBestHour();
}
