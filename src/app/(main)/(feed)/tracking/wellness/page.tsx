import { getTrackingWellnessLogAction, getTrackingSleepInsightAction } from "@/actions/tracking/wellness";
import { WellnessEngineShell } from "@/components/tracking/WellnessEngineShell";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function TrackingWellnessPage() {
  const date = today();
  const [log, sleepInsight] = await Promise.all([
    getTrackingWellnessLogAction(date).catch(() => null),
    getTrackingSleepInsightAction().catch(() => ({ withGoodSleep: null, withoutGoodSleep: null })),
  ]);
  return <WellnessEngineShell initialDate={date} initialLog={log} initialSleepInsight={sleepInsight} />;
}
