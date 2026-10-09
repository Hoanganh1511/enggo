"use client";

// [2026-10-09] Hien thi THOI GIAN + DIA DIEM + LINK HOP.
//
// `formatSchedule()` la noi DUY NHAT bien (scheduleKind, startAt, endAt,
// dueAt) thanh chu cho nguoi doc. Truoc refactor moi view tu ghep chuoi gio
// rieng, nen cung 1 item hien "09:00" o the, "9:00 - 10:30" o danh sach va
// "09:00 → 10:30" o panel. Gio moi noi goi ham nay.
//
// Xu ly DAY DU 4 kieu lich (spec muc D "Handle timed / all-day / unscheduled
// / deadline-only") - khong co kieu nao roi ra ngoai thanh chuoi rong.

import { Clock, Link2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isAllDay,
  minutesOfDay,
  type PlannerItem,
} from "@/lib/planner/planner-domain";

export type TimeFormat = "24H" | "12H";

/** Phut tu nua dem -> nhan gio. 12H tra ve dang "1 PM" (khong "01:00 PM"). */
export function minutesToLabel(m: number, format: TimeFormat = "24H"): string {
  const total = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const min = total % 60;
  if (format === "12H") {
    const h12 = h % 12 || 12;
    const suffix = h < 12 ? "AM" : "PM";
    return min === 0 ? `${h12} ${suffix}` : `${h12}:${min.toString().padStart(2, "0")} ${suffix}`;
  }
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export function isoToTimeLabel(iso: string, format: TimeFormat = "24H"): string {
  return minutesToLabel(minutesOfDay(iso), format);
}

/** "9 thg 10" - ngan, dung khi da biet thang/nam tu ngu canh. */
export function isoToShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} thg ${d.getMonth() + 1}`;
}

function sameLocalDay(a: string, b: string): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

export type ScheduleText = {
  /** Dong chinh - gio hoac ngay. Luon co chu, KHONG BAO GIO rong. */
  primary: string;
  /** Phu them (vd khoang ngay cua su kien nhieu ngay). */
  secondary?: string;
};

/**
 * NGUON DUY NHAT bien lich thanh chu.
 *
 * @param withDate  Kem ngay vao dong chinh (panel chi tiet / danh sach nhieu
 *                  ngay can; the nam san trong 1 o ngay thi khong can).
 */
export function formatSchedule(
  item: PlannerItem,
  format: TimeFormat = "24H",
  withDate = false,
): ScheduleText {
  switch (item.scheduleKind) {
    case "UNSCHEDULED":
      return { primary: "Chưa xếp lịch" };

    case "DEADLINE": {
      if (!item.dueAt) return { primary: "Chưa đặt hạn" };
      const time = isoToTimeLabel(item.dueAt, format);
      return {
        primary: withDate ? `Hạn ${isoToShortDate(item.dueAt)}, ${time}` : `Hạn ${time}`,
      };
    }

    case "ALL_DAY": {
      if (!item.startAt) return { primary: "Cả ngày" };
      // endAt la ngay cuoi BAO GOM (backend chuan hoa vay) - nhieu ngay thi
      // hien khoang, 1 ngay thi chi "Cả ngày".
      const multi = item.endAt && !sameLocalDay(item.startAt, item.endAt);
      if (multi && item.endAt) {
        return {
          primary: "Cả ngày",
          secondary: `${isoToShortDate(item.startAt)} → ${isoToShortDate(item.endAt)}`,
        };
      }
      return {
        primary: withDate ? `Cả ngày, ${isoToShortDate(item.startAt)}` : "Cả ngày",
      };
    }

    case "TIMED": {
      if (!item.startAt) return { primary: "Chưa đặt giờ" };
      const start = isoToTimeLabel(item.startAt, format);
      if (!item.endAt) {
        return { primary: withDate ? `${isoToShortDate(item.startAt)}, ${start}` : start };
      }
      const end = isoToTimeLabel(item.endAt, format);
      // Vat qua nua dem / nhieu ngay: phai noi ro ngay ket thuc, neu khong
      // "23:00 - 01:00" doc ra thanh 1 khoang am.
      if (!sameLocalDay(item.startAt, item.endAt)) {
        return {
          primary: `${start} → ${end}`,
          secondary: `${isoToShortDate(item.startAt)} → ${isoToShortDate(item.endAt)}`,
        };
      }
      const range = `${start} – ${end}`;
      return {
        primary: withDate ? `${isoToShortDate(item.startAt)}, ${range}` : range,
      };
    }
  }
}

/** "1h 30'" / "45'" - thoi luong doc cho nguoi. */
export function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}'`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}'`;
}

// --- Component hien thi ----------------------------------------------------

export function ScheduleDisplay({
  item,
  format = "24H",
  withDate = false,
  withIcon = true,
  accentColor,
  className,
}: {
  item: PlannerItem;
  format?: TimeFormat;
  withDate?: boolean;
  withIcon?: boolean;
  /** Mau category - dong gio tren the lay mau accent cua category. */
  accentColor?: string;
  className?: string;
}) {
  const text = formatSchedule(item, format, withDate);
  const unscheduled = item.scheduleKind === "UNSCHEDULED";
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1 text-[11px] leading-[1.3] font-medium tabular-nums",
        unscheduled && "text-[color:var(--planner-text-muted)] italic",
        className,
      )}
      style={accentColor && !unscheduled ? { color: accentColor } : undefined}
    >
      {withIcon && !isAllDay(item) && !unscheduled && (
        <Clock size={11} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      )}
      <span className="truncate">{text.primary}</span>
      {text.secondary && (
        <span className="truncate text-[color:var(--planner-text-muted)] font-normal">
          · {text.secondary}
        </span>
      )}
    </span>
  );
}

export function LocationDisplay({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1 text-[11px] leading-[1.3] text-[color:var(--planner-text-secondary)]",
        className,
      )}
      title={location}
    >
      <MapPin size={11} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      <span className="truncate">{location}</span>
    </span>
  );
}

/**
 * Link hop. `interactive` = the <a> that su (panel chi tiet) - tren THE tren
 * luoi thi KHONG, vi ca the da la 1 nut mo chi tiet, long <a> vao trong se
 * an mat cu click cua the.
 */
export function MeetingLinkDisplay({
  url,
  interactive = false,
  className,
}: {
  url: string;
  interactive?: boolean;
  className?: string;
}) {
  const href = url.includes("://") ? url : `https://${url}`;
  let label = url;
  try {
    label = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    // URL khong parse duoc - hien nguyen van thay vi an di.
  }
  const inner = (
    <>
      <Link2 size={11} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </>
  );
  const base =
    "inline-flex min-w-0 items-center gap-1 text-[11px] leading-[1.3] text-[color:var(--planner-primary)]";
  if (!interactive) {
    return <span className={cn(base, className)} title={url}>{inner}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, "hover:underline", className)}
      title={url}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </a>
  );
}
