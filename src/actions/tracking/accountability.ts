"use server";

import {
  listMyTrackingGroups,
  createTrackingGroup,
  joinTrackingGroup,
  getTrackingGroup,
  startTrackingGroupSession,
  endTrackingGroupSession,
} from "@/lib/api/tracking";

export async function listMyTrackingGroupsAction() {
  return listMyTrackingGroups();
}
export async function createTrackingGroupAction(name: string) {
  return createTrackingGroup(name);
}
export async function joinTrackingGroupAction(inviteCode: string) {
  return joinTrackingGroup(inviteCode);
}
export async function getTrackingGroupAction(id: string) {
  return getTrackingGroup(id);
}
export async function startTrackingGroupSessionAction(groupId: string, goalText: string) {
  return startTrackingGroupSession(groupId, goalText);
}
export async function endTrackingGroupSessionAction(sessionId: string, completed: boolean) {
  return endTrackingGroupSession(sessionId, completed);
}
