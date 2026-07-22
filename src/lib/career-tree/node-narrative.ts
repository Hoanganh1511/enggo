import type { ApiNodeListItem } from "@/lib/api/types";
import { MAX_EXPECTED_CARDS } from "./constants";
import type { NodeStatus } from "./node-status";
export type HealthInfo = {
  label: string;
  dotClass: string;
  textClass: string;
  // Mau fill cua thanh Mastery - dong bo voi status, khac voi textClass vi
  // thanh progress can mau dam/solid (vd bg-sky-400) thay vi text-*-600/400.
  barClass: string;
};

// Rule mau theo trang thai - dong bo giua status badge / score % / mastery bar.
export function getHealthInfo(status: NodeStatus): HealthInfo {
  switch (status) {
    case "mastered":
      return {
        label: "Mastered",
        dotClass: "bg-violet-500",
        textClass: "text-violet-600 dark:text-violet-400",
        barClass: "bg-violet-500",
      };
    case "healthy":
      return {
        label: "Healthy",
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
        barClass: "bg-emerald-500",
      };
    case "growing":
      return {
        label: "Growing",
        dotClass: "bg-sky-400",
        textClass: "text-sky-600 dark:text-sky-400",
        barClass: "bg-sky-400",
      };
    case "need-review":
      return {
        label: "Cần xem lại",
        dotClass: "bg-amber-500",
        textClass: "text-amber-600 dark:text-amber-400",
        barClass: "bg-amber-500",
      };
    case "stale":
      return {
        label: "Bị lãng quên",
        dotClass: "bg-rose-500",
        textClass: "text-rose-600 dark:text-rose-400",
        barClass: "bg-rose-500",
      };
    default:
      return {
        label: "Không hoạt động",
        dotClass: "bg-slate-500",
        textClass: "text-slate-600 dark:text-slate-400",
        barClass: "bg-slate-400",
      };
  }
}

// Health score (%) - KHAC voi Mastery: ket hop 3 tin hieu thay vi chi dem so
// ghi chu. Trong so: do deu streak 7 ngay gan nhat (40%) + do moi cua hoat
// dong gan nhat (40%) + khong co van de ton dong (20%).
export function getHealthScore(params: {
  last7: boolean[];
  lastActivity: string | null;
  openIssueCount: number;
}): number {
  const consistency = params.last7.filter(Boolean).length / 7;
  const daysSince = params.lastActivity
    ? Math.floor(
        (Date.now() - new Date(params.lastActivity).getTime()) / 86_400_000,
      )
    : Infinity;
  const recency = daysSince === Infinity ? 0 : Math.max(0, 1 - daysSince / 14);
  const issuesPenalty = params.openIssueCount > 0 ? 0 : 1;
  return Math.round(
    (consistency * 0.4 + recency * 0.4 + issuesPenalty * 0.2) * 100,
  );
}

export function getMasteryPercent(cardCount: number): number {
  return Math.round(Math.min(100, (cardCount / MAX_EXPECTED_CARDS) * 100));
}

// Cau dong vien theo nguong % - thuan Vietnamese copy, khong can backend.
export function getMotivationalMessage(percent: number): string {
  if (percent >= 90) return "Gần xong rồi, cố lên!";
  if (percent >= 60) return "Đang tiến bộ tốt, tiếp tục nhé.";
  if (percent >= 30) return "Đã có đà rồi, đừng dừng lại.";
  if (percent > 0) return "Mới bắt đầu — mọi hành trình đều cần bước đầu tiên.";
  return "Chưa có ghi chú nào — bắt đầu học ngay hôm nay.";
}

// So sanh so ngay hoat dong nua-dau vs nua-sau cua 7 ngay gan nhat -> xu huong.
export function getTrendDirection(last7: boolean[]): "up" | "flat" | "down" {
  const firstHalf = last7.slice(0, 3).filter(Boolean).length;
  const secondHalf = last7.slice(4).filter(Boolean).length;
  if (secondHalf > firstHalf) return "up";
  if (secondHalf < firstHalf) return "down";
  return "flat";
}

// Goi y "buoc tiep theo": node con TOPIC dau tien CHUA hoan thanh, theo dung
// thu tu orderIndex - khong can AI, chi can 1 truy van.
export function getNextStepSuggestion(
  childNodes: ApiNodeListItem[],
): ApiNodeListItem | null {
  const incomplete = childNodes
    .filter((n) => n.kind === "TOPIC" && n.cardCount < MAX_EXPECTED_CARDS)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  return incomplete[0] ?? null;
}

// Cau "AI Insight" ruoi-based - doc duoc nhu that vi dua tren du lieu that,
// nhung khong goi LLM.
export function getInsightMessage(params: {
  masteryPercent: number;
  nextStep: ApiNodeListItem | null;
  openIssueCount: number;
}): string {
  if (params.openIssueCount > 0) {
    return `Còn ${params.openIssueCount} vấn đề tồn đọng chưa giải quyết — nên xử lý trước khi học tiếp.`;
  }
  if (params.nextStep) {
    return `Bạn đã sẵn sàng để nâng cấp kiến thức — thử sang "${params.nextStep.title}".`;
  }
  if (params.masteryPercent >= 90) {
    return "Bạn đã nắm vững chủ đề này — hãy thêm nhánh mới để mở rộng.";
  }
  return "Tiếp tục ghi chú đều đặn để lấp đầy các khoảng trống kiến thức.";
}
