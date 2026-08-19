import { CheckCircle2, Circle, CircleAlert, CircleDashed, type LucideIcon } from "lucide-react";
import type { ChecklistStatus } from "@/lib/api/types";

// 4 trang thai dung chung cho ca "Kế hoạch học tập" (ArticleChecklist.tsx,
// theo bai viet) LAN "Mục tiêu học tập" (GroupGoalsSection.tsx, theo nhom) -
// tach rieng file nay de 2 noi khong dinh nghia lai/le nhau. Bam vao icon
// trang thai de xoay vong qua 4 muc (khong dung dropdown/popover rieng).
export const STATUS_ORDER: ChecklistStatus[] = [
  "NOT_UNDERSTOOD",
  "IN_PROGRESS",
  "UNDERSTOOD",
  "NEEDS_REVIEW",
];

export const STATUS_LABEL: Record<ChecklistStatus, string> = {
  NOT_UNDERSTOOD: "Chưa học",
  IN_PROGRESS: "Đang học",
  UNDERSTOOD: "Đã nắm",
  NEEDS_REVIEW: "Cần ôn",
};

export const STATUS_ICON: Record<ChecklistStatus, LucideIcon> = {
  NOT_UNDERSTOOD: Circle,
  IN_PROGRESS: CircleDashed,
  UNDERSTOOD: CheckCircle2,
  NEEDS_REVIEW: CircleAlert,
};

export const STATUS_COLOR: Record<ChecklistStatus, string> = {
  NOT_UNDERSTOOD: "var(--ink-faint)",
  IN_PROGRESS: "var(--primary)",
  UNDERSTOOD: "var(--success)",
  NEEDS_REVIEW: "var(--warning)",
};

export function nextStatus(status: ChecklistStatus): ChecklistStatus {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
}
