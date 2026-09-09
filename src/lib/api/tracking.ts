import { apiFetch } from "./client";

// Toan bo type/API cho khu vuc /tracking (7 module) gom chung 1 file thay vi
// rai vao types.ts - be mat type kha lon (8+ shape), giu CUC BO o day de de
// scan theo domain thay vi lan giua types.ts dung chung toan app.

// ---- Goal Compass (Goal -> Milestone -> Action/Step) ----
export type ApiTrackingGoalStep = {
  id: string;
  goalId: string;
  milestoneId: string | null;
  title: string;
  dueDate: string | null;
  done: boolean;
  orderIndex: number;
  estimatedMinutes: number | null;
};
export type ApiTrackingMilestone = {
  id: string;
  goalId: string;
  title: string;
  orderIndex: number;
  weeklyGoalNote: string | null;
  // null = chua co step nao gan dueDate trong tuan nay (khac voi "0/0").
  weeklyProgress: { done: number; total: number } | null;
  steps: ApiTrackingGoalStep[];
};
export type ApiTrackingGoal = {
  id: string;
  title: string;
  category: string;
  startDate: string | null;
  targetDate: string | null;
  important: boolean;
  controllable: boolean;
  why: string | null;
  estimatedHoursPerWeek: number | null;
  milestones: ApiTrackingMilestone[];
  // Step CHUA gan milestone nao (du lieu cu, hoac co tinh khong gan).
  steps: ApiTrackingGoalStep[];
  createdAt: string;
  updatedAt: string;
};
export type TrackingGoalInput = {
  title: string;
  category: string;
  startDate?: string;
  targetDate?: string;
  important?: boolean;
  controllable?: boolean;
  why?: string;
  estimatedHoursPerWeek?: number;
};
export type TrackingGoalStepInput = {
  title: string;
  dueDate?: string;
  estimatedMinutes?: number;
};
export type TrackingMilestoneInput = { title: string };
export type ApiTrackingRealityCheck = {
  neededHours: number;
  availableHours: number;
  overloadHours: number;
};

export function listTrackingGoals(): Promise<ApiTrackingGoal[]> {
  return apiFetch<ApiTrackingGoal[]>("/tracking/goals");
}
export function createTrackingGoal(dto: TrackingGoalInput): Promise<ApiTrackingGoal> {
  return apiFetch<ApiTrackingGoal>("/tracking/goals", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateTrackingGoal(
  id: string,
  dto: Partial<TrackingGoalInput>,
): Promise<ApiTrackingGoal> {
  return apiFetch<ApiTrackingGoal>(`/tracking/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteTrackingGoal(id: string): Promise<void> {
  return apiFetch<void>(`/tracking/goals/${id}`, { method: "DELETE" });
}
export function createTrackingMilestone(
  goalId: string,
  dto: TrackingMilestoneInput,
): Promise<ApiTrackingMilestone> {
  return apiFetch<ApiTrackingMilestone>(`/tracking/goals/${goalId}/milestones`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateTrackingMilestone(
  milestoneId: string,
  dto: Partial<TrackingMilestoneInput> & { orderIndex?: number; weeklyGoalNote?: string },
): Promise<ApiTrackingMilestone> {
  return apiFetch<ApiTrackingMilestone>(`/tracking/goals/milestones/${milestoneId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteTrackingMilestone(milestoneId: string): Promise<void> {
  return apiFetch<void>(`/tracking/goals/milestones/${milestoneId}`, { method: "DELETE" });
}
export function createTrackingGoalStep(
  goalId: string,
  dto: TrackingGoalStepInput,
): Promise<ApiTrackingGoalStep> {
  return apiFetch<ApiTrackingGoalStep>(`/tracking/goals/${goalId}/steps`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function createTrackingGoalStepUnderMilestone(
  milestoneId: string,
  dto: TrackingGoalStepInput,
): Promise<ApiTrackingGoalStep> {
  return apiFetch<ApiTrackingGoalStep>(`/tracking/goals/milestones/${milestoneId}/steps`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateTrackingGoalStep(
  stepId: string,
  dto: Partial<TrackingGoalStepInput> & { done?: boolean; orderIndex?: number },
): Promise<ApiTrackingGoalStep> {
  return apiFetch<ApiTrackingGoalStep>(`/tracking/goals/steps/${stepId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteTrackingGoalStep(stepId: string): Promise<void> {
  return apiFetch<void>(`/tracking/goals/steps/${stepId}`, { method: "DELETE" });
}
export function getTrackingRealityCheck(): Promise<ApiTrackingRealityCheck> {
  return apiFetch<ApiTrackingRealityCheck>("/tracking/goals/reality-check");
}
export function upsertTrackingSettings(
  weeklyAvailableHours: number,
): Promise<{ weeklyAvailableHours: number }> {
  return apiFetch<{ weeklyAvailableHours: number }>("/tracking/goals/settings", {
    method: "PUT",
    body: JSON.stringify({ weeklyAvailableHours }),
  });
}

// ---- Weekly Planner ----
export type TrackingTimeBlockKind = "FOCUSED" | "GENERAL" | "LIFE" | "BUFFER";
export type ApiTrackingTimeBlock = {
  id: string;
  date: string;
  startMinute: number;
  endMinute: number;
  label: string;
  kind: TrackingTimeBlockKind;
  goalStepId: string | null;
};
export type TrackingTimeBlockInput = {
  date: string;
  startMinute: number;
  endMinute: number;
  label: string;
  kind?: TrackingTimeBlockKind;
  goalStepId?: string;
};

export function listTrackingTimeBlocks(weekStart: string): Promise<ApiTrackingTimeBlock[]> {
  return apiFetch<ApiTrackingTimeBlock[]>(
    `/tracking/time-blocks?weekStart=${encodeURIComponent(weekStart)}`,
  );
}
export function createTrackingTimeBlock(
  dto: TrackingTimeBlockInput,
): Promise<ApiTrackingTimeBlock> {
  return apiFetch<ApiTrackingTimeBlock>("/tracking/time-blocks", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateTrackingTimeBlock(
  id: string,
  dto: Partial<Omit<TrackingTimeBlockInput, "date" | "goalStepId">>,
): Promise<ApiTrackingTimeBlock> {
  return apiFetch<ApiTrackingTimeBlock>(`/tracking/time-blocks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteTrackingTimeBlock(id: string): Promise<void> {
  return apiFetch<void>(`/tracking/time-blocks/${id}`, { method: "DELETE" });
}

// ---- Daily Command Center ----
export type TrackingSkipReason = "AVOIDANCE" | "OUT_OF_TIME" | "INTERRUPTED" | "MISESTIMATED";
export type ApiTrackingTask = {
  id: string;
  date: string;
  title: string;
  timeBlockId: string | null;
  estimatedMinutes: number | null;
  done: boolean;
  pinned: boolean;
  skipReason: TrackingSkipReason | null;
  reviewNote: string | null;
  postponedCount: number;
  createdAt: string;
};
export type TrackingTaskInput = {
  date: string;
  title: string;
  timeBlockId?: string;
  estimatedMinutes?: number;
};

export function listTrackingTasks(date: string): Promise<ApiTrackingTask[]> {
  return apiFetch<ApiTrackingTask[]>(`/tracking/tasks?date=${encodeURIComponent(date)}`);
}
export function createTrackingTask(dto: TrackingTaskInput): Promise<ApiTrackingTask> {
  return apiFetch<ApiTrackingTask>("/tracking/tasks", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateTrackingTask(
  id: string,
  dto: Partial<{
    title: string;
    done: boolean;
    pinned: boolean;
    estimatedMinutes: number;
    skipReason: TrackingSkipReason;
    reviewNote: string;
  }>,
): Promise<ApiTrackingTask> {
  return apiFetch<ApiTrackingTask>(`/tracking/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteTrackingTask(id: string): Promise<void> {
  return apiFetch<void>(`/tracking/tasks/${id}`, { method: "DELETE" });
}
export function postponeTrackingTask(id: string): Promise<ApiTrackingTask> {
  return apiFetch<ApiTrackingTask>(`/tracking/tasks/${id}/postpone`, { method: "POST" });
}

// ---- Energy Tracker ----
export type ApiTrackingEnergyCheckin = {
  id: string;
  checkedAt: string;
  physical: number;
  emotional: number;
  mental: number;
};
export type TrackingEnergyCheckinInput = {
  physical: number;
  emotional: number;
  mental: number;
};

export function listTrackingEnergyCheckins(
  from?: string,
  to?: string,
): Promise<ApiTrackingEnergyCheckin[]> {
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const qs = q.toString();
  return apiFetch<ApiTrackingEnergyCheckin[]>(`/tracking/energy${qs ? `?${qs}` : ""}`);
}
export function createTrackingEnergyCheckin(
  dto: TrackingEnergyCheckinInput,
): Promise<ApiTrackingEnergyCheckin> {
  return apiFetch<ApiTrackingEnergyCheckin>("/tracking/energy", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
// Weekly Planner doc gia tri nay de goi y gio dep cho khoi FOCUSED - null
// khi chua du checkin (xem MIN_CHECKINS_FOR_BEST_HOUR o backend).
export type ApiTrackingBestHour = { hour: number; avgMental: number } | null;
export function getTrackingBestHour(): Promise<ApiTrackingBestHour> {
  return apiFetch<ApiTrackingBestHour>("/tracking/energy/best-hour");
}

// ---- Wellness Engine ----
export type ApiTrackingWellnessLog = {
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  napMinutes: number | null;
  exerciseMinutes: number | null;
  mealsLogged: number;
  notes: string | null;
};
export type TrackingWellnessLogInput = Partial<{
  sleepHours: number;
  sleepQuality: number;
  napMinutes: number;
  exerciseMinutes: number;
  mealsLogged: number;
  notes: string;
}>;

export function getTrackingWellnessLog(date: string): Promise<ApiTrackingWellnessLog | null> {
  return apiFetch<ApiTrackingWellnessLog | null>(`/tracking/wellness/${date}`);
}
export function upsertTrackingWellnessLog(
  date: string,
  dto: TrackingWellnessLogInput,
): Promise<ApiTrackingWellnessLog> {
  return apiFetch<ApiTrackingWellnessLog>(`/tracking/wellness/${date}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}
export type ApiTrackingSleepInsight = {
  withGoodSleep: number | null;
  withoutGoodSleep: number | null;
};
export function getTrackingSleepInsight(): Promise<ApiTrackingSleepInsight> {
  return apiFetch<ApiTrackingSleepInsight>("/tracking/wellness/sleep-insight");
}

// ---- Accountability Hub ----
export type ApiTrackingGroup = {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  createdAt: string;
};
export type ApiTrackingGroupSession = {
  id: string;
  groupId: string;
  userId: string;
  goalText: string;
  completed: boolean;
  startedAt: string;
  endedAt: string | null;
};
export type ApiTrackingGroupDetail = ApiTrackingGroup & {
  memberIds: string[];
  recentSessions: ApiTrackingGroupSession[];
};

export function listMyTrackingGroups(): Promise<ApiTrackingGroup[]> {
  return apiFetch<ApiTrackingGroup[]>("/tracking/groups/mine");
}
export function createTrackingGroup(name: string): Promise<ApiTrackingGroup> {
  return apiFetch<ApiTrackingGroup>("/tracking/groups", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
export function joinTrackingGroup(inviteCode: string): Promise<ApiTrackingGroup> {
  return apiFetch<ApiTrackingGroup>("/tracking/groups/join", {
    method: "POST",
    body: JSON.stringify({ inviteCode }),
  });
}
export function getTrackingGroup(id: string): Promise<ApiTrackingGroupDetail> {
  return apiFetch<ApiTrackingGroupDetail>(`/tracking/groups/${id}`);
}
export function startTrackingGroupSession(
  groupId: string,
  goalText: string,
): Promise<ApiTrackingGroupSession> {
  return apiFetch<ApiTrackingGroupSession>(`/tracking/groups/${groupId}/sessions`, {
    method: "POST",
    body: JSON.stringify({ goalText }),
  });
}
export function endTrackingGroupSession(
  sessionId: string,
  completed: boolean,
): Promise<ApiTrackingGroupSession> {
  return apiFetch<ApiTrackingGroupSession>(`/tracking/groups/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
}

// ---- Analytics + Assistant ----
export type ApiTrackingWeeklySummary = {
  from: string;
  to: string;
  taskCompletionRate: number | null;
  tasksDone: number;
  tasksTotal: number;
  avgEnergy: { physical: number; emotional: number; mental: number } | null;
  avgSleepHours: number | null;
  groupSessionCount: number;
};

export function getTrackingWeeklySummary(): Promise<ApiTrackingWeeklySummary> {
  return apiFetch<ApiTrackingWeeklySummary>("/tracking/analytics/weekly");
}
export function getTrackingCoachSuggestions(): Promise<{ suggestions: string }> {
  return apiFetch<{ suggestions: string }>("/tracking/assistant/coach", { method: "POST" });
}
// "Data -> Pattern -> Recommendation" RULE-BASED (khong AI) - null khi chua
// du du lieu energy hoac khong co gi lech can chinh.
export type ApiTrackingRecommendation = { bestHour: number; focusedBlocksToRealign: number } | null;
export function getTrackingRecommendation(): Promise<ApiTrackingRecommendation> {
  return apiFetch<ApiTrackingRecommendation>("/tracking/analytics/recommendation");
}
export function applyTrackingBestHour(): Promise<ApiTrackingTimeBlock[]> {
  return apiFetch<ApiTrackingTimeBlock[]>("/tracking/analytics/apply-best-hour", {
    method: "POST",
  });
}
