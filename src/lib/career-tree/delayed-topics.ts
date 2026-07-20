import type { ApiNodeListItem } from "@/lib/api/types";
import { getDaysSinceActivity, getDelayStatus } from "./constants";
import { getRealChildrenCount } from "./filter-visible-nodes";

export type DelayedTopic = {
  nodeId: string;
  title: string;
  daysSince: number | null;
};

// "Việc của bạn" trong panel thông báo: chủ đề lá (không có con), đã từng có
// hoạt động (cardCount > 0, tránh làm phiền vì node mới tạo còn trống), và
// đang ở mức "danger" (>30 ngày hoặc chưa từng hoạt động dù đã có ghi chú
// trước đó — trường hợp hiếm nhưng vẫn xử lý đúng qua getDelayStatus).
// Tính runtime từ allNodes hiện có, không lưu DB — luôn khớp trạng thái thật,
// không cần tự đồng bộ lại khi có hoạt động mới.
export function getDelayedTopics(nodes: ApiNodeListItem[]): DelayedTopic[] {
  const childrenCount = getRealChildrenCount(nodes);
  return nodes
    .filter((n) => n.depth > 0 && (childrenCount.get(n.id) ?? 0) === 0)
    .filter((n) => n.cardCount > 0)
    .filter((n) => getDelayStatus(n.lastActivity) === "danger")
    .map((n) => ({
      nodeId: n.id,
      title: n.title,
      daysSince: getDaysSinceActivity(n.lastActivity),
    }))
    .sort((a, b) => (b.daysSince ?? 0) - (a.daysSince ?? 0));
}
