import { listTrackingGoalsAction, getTrackingRealityCheckAction } from "@/actions/tracking/goals";
import { GoalCompassShell } from "@/components/tracking/GoalCompassShell";

export default async function TrackingGoalsPage() {
  const [goals, realityCheck] = await Promise.all([
    listTrackingGoalsAction().catch(() => []),
    getTrackingRealityCheckAction().catch(() => null),
  ]);
  return <GoalCompassShell initialGoals={goals} initialRealityCheck={realityCheck} />;
}
