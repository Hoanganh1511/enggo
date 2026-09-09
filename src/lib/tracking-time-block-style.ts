import type { TrackingTimeBlockKind } from "@/lib/api/tracking";

// Mau/nhan cho TrackingTimeBlockKind - dung chung giua Lich tuan
// (WeeklyPlannerShell) va Lich trinh hom nay (DailyCommandCenterShell) de
// khong lap dinh nghia 2 noi.
export const KIND_STYLE: Record<TrackingTimeBlockKind, string> = {
  FOCUSED: "bg-violet-100 border-violet-300 text-violet-800",
  GENERAL: "bg-emerald-100 border-emerald-300 text-emerald-800",
  LIFE: "bg-sky-100 border-sky-300 text-sky-800",
  BUFFER: "border-dashed bg-surface-muted border-border text-ink-faint",
};
export const KIND_LABEL: Record<TrackingTimeBlockKind, string> = {
  FOCUSED: "Tập trung cao",
  GENERAL: "Việc nhẹ",
  LIFE: "Sinh hoạt",
  BUFFER: "Đệm",
};
export const KIND_DOT: Record<TrackingTimeBlockKind, string> = {
  FOCUSED: "bg-violet-500",
  GENERAL: "bg-emerald-500",
  LIFE: "bg-sky-500",
  BUFFER: "bg-ink-faint",
};
