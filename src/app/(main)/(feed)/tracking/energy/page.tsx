import { listTrackingEnergyCheckinsAction, getTrackingBestHourAction } from "@/actions/tracking/energy";
import { getTrackingWellnessLogAction } from "@/actions/tracking/wellness";
import { EnergyTrackerShell } from "@/components/tracking/EnergyTrackerShell";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function TrackingEnergyPage() {
  // Fetch song song - bestHour (da co endpoint, truoc gio chi dung o Weekly
  // Planner) va nhat ky suc khoe hom nay dung cho 2 khoi cheo-lien-ket moi
  // tren trang nay (mockup man 06: "Gợi ý cho bạn" + "Sức khoẻ hôm nay").
  const [checkins, bestHour, wellnessToday] = await Promise.all([
    listTrackingEnergyCheckinsAction().catch(() => []),
    getTrackingBestHourAction().catch(() => null),
    getTrackingWellnessLogAction(today()).catch(() => null),
  ]);
  return (
    <EnergyTrackerShell
      initialCheckins={checkins}
      bestHour={bestHour}
      wellnessToday={wellnessToday}
    />
  );
}
