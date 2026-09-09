import { listTrackingTasksAction } from "@/actions/tracking/daily";
import { listTrackingEnergyCheckinsAction } from "@/actions/tracking/energy";
import { listMyTrackingGroupsAction } from "@/actions/tracking/accountability";
import { listTrackingTimeBlocksAction } from "@/actions/tracking/weekly";
import { DailyCommandCenterShell } from "@/components/tracking/DailyCommandCenterShell";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function TrackingDailyPage() {
  const date = today();
  // Fetch song song - checkin nang luong hom nay dung de hien badge goi y
  // tren hero task, danh sach nhom dung cho nut "Làm cùng nhóm" (Execution
  // stage, xem plan "Flow — lam du vong lap con lai" muc E), time block hom
  // nay dung cho "Lich trinh hom nay" (mockup man 05) - tai dung
  // listForWeek(weekStart=date) roi loc dung ngay, khong can endpoint moi.
  const [tasks, energyToday, groups, weekBlocks] = await Promise.all([
    listTrackingTasksAction(date).catch(() => []),
    listTrackingEnergyCheckinsAction(date, date).catch(() => []),
    listMyTrackingGroupsAction().catch(() => []),
    listTrackingTimeBlocksAction(date).catch(() => []),
  ]);
  const initialBlocks = weekBlocks.filter((b) => b.date === date);
  return (
    <DailyCommandCenterShell
      initialDate={date}
      initialTasks={tasks}
      initialEnergyToday={energyToday}
      groups={groups}
      initialBlocks={initialBlocks}
    />
  );
}
