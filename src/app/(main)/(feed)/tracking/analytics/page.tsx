import {
  getTrackingWeeklySummaryAction,
  getTrackingRecommendationAction,
} from "@/actions/tracking/analytics";
import { getTrackingBestHourAction } from "@/actions/tracking/energy";
import { getTrackingSleepInsightAction } from "@/actions/tracking/wellness";
import { AnalyticsShell } from "@/components/tracking/AnalyticsShell";

export default async function TrackingAnalyticsPage() {
  // bestHour + sleepInsight da co endpoint tu truoc (dung o Weekly Planner/
  // Wellness), fetch them de lam khoi "Điều chúng tôi học được" (mockup man
  // 08) - CHI dung tin hieu da tinh duoc that, khong bia so lieu moi.
  const [summary, recommendation, bestHour, sleepInsight] = await Promise.all([
    getTrackingWeeklySummaryAction().catch(() => null),
    getTrackingRecommendationAction().catch(() => null),
    getTrackingBestHourAction().catch(() => null),
    getTrackingSleepInsightAction().catch(() => null),
  ]);
  return (
    <AnalyticsShell
      initialSummary={summary}
      initialRecommendation={recommendation}
      bestHour={bestHour}
      sleepInsight={sleepInsight}
    />
  );
}
