import { listTrackingTimeBlocksAction } from "@/actions/tracking/weekly";
import { WeeklyPlannerShell } from "@/components/tracking/WeeklyPlannerShell";

function currentWeekStart(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Chu nhat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

export default async function TrackingWeeklyPage() {
  const weekStart = currentWeekStart();
  const blocks = await listTrackingTimeBlocksAction(weekStart).catch(() => []);
  return <WeeklyPlannerShell initialWeekStart={weekStart} initialBlocks={blocks} />;
}
