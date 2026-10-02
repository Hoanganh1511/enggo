import { listPlannerItemsAction } from "@/actions/planner/planner";
import { PlannerShell } from "@/components/planner/PlannerShell";

function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Chu nhat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function PlannerPage() {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = startOfWeek(today);
  const items = await listPlannerItemsAction(weekStart, addDays(weekStart, 6)).catch(() => []);
  return <PlannerShell initialDate={today} initialItems={items} />;
}
