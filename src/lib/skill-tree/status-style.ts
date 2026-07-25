import type { NodeStatus } from "@/lib/career-tree/node-status";

// Dung chung 1 rule mau voi GrowthCard (xem node-narrative.ts getHealthInfo)
// de trai nghiem nhat quan giua canvas chinh va trang Skill Tree: violet =
// mastered, emerald = healthy, sky = growing, amber = need-review, rose =
// stale, slate = inactive (node that KHONG co khai niem "locked" - moi node
// deu bam xem duoc, "inactive" chi la chua co hoat dong nao).
export const STATUS_LABEL: Record<NodeStatus, string> = {
  mastered: "Mastered",
  healthy: "Healthy",
  growing: "Growing",
  "need-review": "Needs review",
  stale: "Stale",
  inactive: "Inactive",
};

export const LEGEND_ITEMS: { status: NodeStatus; label: string }[] = [
  { status: "mastered", label: "Mastered" },
  { status: "healthy", label: "Healthy" },
  { status: "growing", label: "Growing" },
  { status: "need-review", label: "Needs review" },
  { status: "stale", label: "Stale" },
  { status: "inactive", label: "Inactive" },
];

export type StatusStyle = {
  dotClass: string;
  textClass: string;
  badgeClass: string; // nen + vien hex icon badge
  borderClass: string; // vien card node
  barClass: string; // fill thanh progress
  // Gia tri hex that (== dung mau Tailwind -500/-400 o tren) - can cho cac
  // component dung inline style (gradient/glow dong theo trang thai) ma
  // Tailwind class khong lam duoc, vd SkillCard.tsx.
  hex: string;
};

const STATUS_STYLE: Record<NodeStatus, StatusStyle> = {
  mastered: {
    dotClass: "bg-violet-500",
    textClass: "text-violet-600 dark:text-violet-400",
    badgeClass: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    borderClass: "border-violet-500/40",
    barClass: "bg-violet-500",
    hex: "#8b5cf6",
  },
  healthy: {
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    borderClass: "border-emerald-500/40",
    barClass: "bg-emerald-500",
    hex: "#10b981",
  },
  growing: {
    dotClass: "bg-sky-400",
    textClass: "text-sky-600 dark:text-sky-400",
    badgeClass: "bg-sky-400/15 text-sky-400 border-sky-400/30",
    borderClass: "border-sky-400/40",
    barClass: "bg-sky-400",
    hex: "#38bdf8",
  },
  "need-review": {
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    borderClass: "border-amber-500/40",
    barClass: "bg-amber-500",
    hex: "#f59e0b",
  },
  stale: {
    dotClass: "bg-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    borderClass: "border-rose-500/40",
    barClass: "bg-rose-500",
    hex: "#f43f5e",
  },
  inactive: {
    dotClass: "bg-slate-500",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    borderClass: "border-border",
    barClass: "bg-slate-400",
    hex: "#64748b",
  },
};

export function getStatusStyle(status: NodeStatus): StatusStyle {
  return STATUS_STYLE[status];
}

// Trang thai cap Category/Knowledge Block chi la uoc luong don gian tu
// mastery trung binh - khong co streak/issue rieng cho Category (nhung tin
// hieu do gan voi Node), nen dung nguong % thay vi tai su dung getNodeStatus
// (von can streak/issue). Dung chung cho CategoryCard.tsx va
// KnowledgeBlockCard.tsx/category-stats.ts de khong lap lai nguong 2 noi.
export function estimateCategoryStatus(avgMasteryPercent: number): NodeStatus {
  if (avgMasteryPercent >= 90) return "mastered";
  if (avgMasteryPercent >= 60) return "healthy";
  if (avgMasteryPercent > 0) return "growing";
  return "inactive";
}

// vd hexToRgba("#8b5cf6", 0.14) -> "rgba(139, 92, 246, 0.14)" - dung cho cac
// gradient/glow dong theo status trong SkillCard.tsx.
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
