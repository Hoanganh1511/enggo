// 6 trang thai suy tu du lieu that (streak/mastery/lastActivity/openIssue),
// khong phai enum luu trong DB - dung de to mau nhat quan cho status
// badge/score/mastery bar tren GrowthCard.
export type NodeStatus =
  | "mastered"
  | "healthy"
  | "growing"
  | "need-review"
  | "stale"
  | "inactive";

// Nguong "lau khong dong" tinh la Stale - kien thuc coi nhu suy giam.
const STALE_DAYS_THRESHOLD = 30;

export function getNodeStatus(params: {
  streakCurrent: number;
  openIssueCount: number;
  masteryPercent: number;
  lastActivity: string | null;
}): NodeStatus {
  if (params.openIssueCount > 0) return "need-review";
  if (!params.lastActivity) return "inactive";

  const daysSince = Math.floor(
    (Date.now() - new Date(params.lastActivity).getTime()) / 86_400_000,
  );
  if (daysSince > STALE_DAYS_THRESHOLD) return "stale";
  if (params.masteryPercent >= 90) return "mastered";
  if (params.streakCurrent > 0) return "growing";
  return "healthy";
}
