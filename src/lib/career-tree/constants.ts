// Growth encoding: kích thước theo cardCount (log scale), màu/tần suất theo độ tươi (lastActivity)

export const NODE_SIZE_MIN = 80;
export const NODE_SIZE_MAX = 160;
export const MAX_EXPECTED_CARDS = 20;

export function getNodeSize(cardCount: number): number {
  const ratio = Math.log(cardCount + 1) / Math.log(MAX_EXPECTED_CARDS + 1);
  const size = NODE_SIZE_MIN + (NODE_SIZE_MAX - NODE_SIZE_MIN) * ratio;
  return Math.min(NODE_SIZE_MAX, Math.max(NODE_SIZE_MIN, size));
}

export type FreshnessLevel = "fresh" | "recent" | "fading" | "stale";

export function getFreshnessLevel(lastActivity: string | null): FreshnessLevel {
  if (!lastActivity) return "stale";
  const days =
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return "fresh";
  if (days < 30) return "recent";
  if (days < 90) return "fading";
  return "stale";
}

const FRESHNESS_COLORS: Record<FreshnessLevel, string> = {
  fresh: "#22c55e",
  recent: "#86a878",
  fading: "#a3a89a",
  stale: "#a1a1aa",
};

export function getFreshnessColor(lastActivity: string | null): string {
  return FRESHNESS_COLORS[getFreshnessLevel(lastActivity)];
}

// Mức "delay" hiển thị màu semantic trên canvas: fresh (<7 ngày) = xanh,
// recent (7-30 ngày) = vàng, fading/stale (>30 ngày hoặc chưa từng hoạt
// động) = đỏ — gộp 2 mức cuối vì cả hai đều đáng báo động ở mức UI, dù
// getFreshnessLevel vẫn phân biệt 4 mức cho phần khác (label tần suất).
export type DelayStatus = "success" | "warning" | "danger";

const DELAY_STATUS_BY_LEVEL: Record<FreshnessLevel, DelayStatus> = {
  fresh: "success",
  recent: "warning",
  fading: "danger",
  stale: "danger",
};

export function getDelayStatus(lastActivity: string | null): DelayStatus {
  return DELAY_STATUS_BY_LEVEL[getFreshnessLevel(lastActivity)];
}

// Số ngày kể từ lần hoạt động gần nhất — null nếu chưa từng có hoạt động.
export function getDaysSinceActivity(lastActivity: string | null): number | null {
  if (!lastActivity) return null;
  return Math.floor(
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24),
  );
}
