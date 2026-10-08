// [2026-10-08] Lop "cau noi" giua model THAT cua Planner (ApiPlannerItem,
// src/lib/api/planner.ts - itemType Action/Event/Habit/Reflection, backend
// that) va model CalendarEvent/Reminder (calendar-types.ts - dung boi
// EventForm/ReminderForm, von duoc thiet ke DOC LAP, khong biet gi ve
// LifeItemType). YEU CAU NGUOI DUNG: "thay nguyên những tính năng đã prompt
// chuyên nghiệp gần đây" - dua EventForm/ReminderForm thanh luong tao/sua
// viec CHINH cua /planner that, THAY THE hoan toan man hinh chon Type
// (Action/Event/Habit/Reflection) truoc day.
//
// [2026-10-08] GIOI HAN THAT, flag ro (khong co migration backend nao trong
// task nay - itemType Action/Event/Habit/Reflection VAN la enum CO DINH
// phia backend, khong xoa duoc khoi schema):
// - Tao moi qua EventForm -> luon itemType="EVENT". Tao moi qua ReminderForm
//   -> luon itemType="ACTION" (gan nghia nhat voi "reminder": 1 viec can
//   lam, co uu tien/han chot). HABIT/REFLECTION KHONG CON duong tao moi nao
//   trong UI nay nua - item Habit/Reflection CU (tao tu truoc) VAN hien thi
//   binh thuong tren luoi (TimedItemChip khong quan tam no duoc tao bang
//   form nao), nhung bam "Sửa" tren 1 item Habit/Reflection se mo
//   ReminderForm (form chung gan nhat) - cac field RIENG cua Habit
//   (frequencyPerWeek/preferredDays...) hay Reflection (prompts) se KHONG
//   hien/sua duoc qua ReminderForm, nhung VAN con nguyen trong metadata (chi
//   doc lai dung khi mo lai bang 1 man hinh khac biet Habit/Reflection sau
//   nay, khong bi XOA).
// - "calendar" (EventForm)/"list" (ReminderForm) - khong co khai niem nhieu
//   calendar/list THAT o backend (chi 1 Planner DUY NHAT cho moi user) - tai
//   dung field `area` co san (ApiPlannerItem.area) de luu/doc ten
//   "calendar"/"list" nguoi dung go, VA dua ra 1 danh sach goi y CO DINH
//   (PLANNER_CALENDAR_NAMES) cho props `calendars`/`lists` - KHONG phai danh
//   sach THAT quan ly duoc (khong co SharedCalendarForm nao dong bo nguoc
//   lai danh sach nay).
// - CalendarEvent ho tro event NHIEU NGAY (startDate != endDate) nhung
//   ApiPlannerItem CHI co 1 `date` DUY NHAT + scheduledMinute/durationMinutes
//   (khong co endDate rieng) - event nhieu ngay se bi CAT NGAN ve DUNG ngay
//   bat dau luc luu (endDate ghi vao metadata.endDate CHI de hien thi lai
//   dung khi MO LAI qua EventForm, KHONG anh huong cach item hien tren luoi
//   tuan/thang that - item van chi xuat hien o 1 ngay).
// - Alerts/travelTime/invitees/availability/attachments (EventForm) va
//   subtasks/earlyReminder/images/tags(*)/flagged (ReminderForm) KHONG co
//   cot backend rieng - luu trong `metadata` (JSON tu do, mau hinh da dung
//   nhieu lan trong phien nay: location/recurrence o QuickAddPopover). *tags
//   co san 1 cot THAT (ApiPlannerItem.tags) nen KHONG can qua metadata.
// - RecurrenceEditor KHONG duoc gan vao EventForm/ReminderForm trong lan
//   tich hop nay (2 form đó vốn được code TRƯỚC, không có sẵn 1 hàng "Repeat"
//   nào trong UI của chúng) - chọn "Recurring" trong TaskTypePicker hiện mở
//   THANG EventForm (giống "Event") - CHƯA có cách thật đặt recurrence qua
//   luồng tạo mới này.

import type { ApiPlannerItem, PlannerItemUpdateInput } from "@/lib/api/planner";
import type { LifeItemPriority, LifeItemType } from "@/lib/planner/life-item-types";
import type {
  CalendarEvent,
  Reminder,
  Priority,
  AlertOffset,
  TravelTime,
  Invitee,
  Availability,
  EventAttachment,
  Subtask,
  EarlyReminder,
  ReminderImage,
} from "./calendar-types";

export const PLANNER_CALENDAR_NAMES = ["Personal", "Work", "Family"];
export const PLANNER_REMINDER_LISTS = [
  { name: "Personal", color: "#ff3b30" },
  { name: "Work", color: "#007aff" },
  { name: "Family", color: "#ff9500" },
];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
function minutesToHM(minutes: number): string {
  return `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`;
}
function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}
// deadline luu dang "YYYY-MM-DDTHH:MM:00" (xem dateAndMinuteToISO trong
// PlannerShell.tsx) - tach lai date/time.
function splitDeadline(deadline: string): { date: string; time: string } {
  const [date, time] = deadline.split("T");
  return { date, time: (time ?? "00:00:00").slice(0, 5) };
}
function priorityToCalendar(p: LifeItemPriority | null): Priority {
  if (p === "HIGH") return "high";
  if (p === "MEDIUM") return "medium";
  if (p === "LOW") return "low";
  return "none";
}
function priorityFromCalendar(p: Priority): LifeItemPriority | undefined {
  if (p === "high") return "HIGH";
  if (p === "medium") return "MEDIUM";
  if (p === "low") return "LOW";
  return undefined;
}

// ---------------------------------------------------------------------------
// CalendarEvent <-> ApiPlannerItem.
// ---------------------------------------------------------------------------

export function apiItemToCalendarEvent(item: ApiPlannerItem): CalendarEvent {
  const meta = item.metadata ?? {};
  const hasTime = item.scheduledMinute !== null;
  const startTime = hasTime ? minutesToHM(item.scheduledMinute!) : null;
  const endTime = hasTime
    ? minutesToHM(Math.min(item.scheduledMinute! + (item.durationMinutes ?? 60), 24 * 60 - 1))
    : null;
  return {
    id: item.id,
    title: item.title,
    calendar: item.area || PLANNER_CALENDAR_NAMES[0],
    startDate: item.date,
    startTime,
    endDate: typeof meta.endDate === "string" ? meta.endDate : item.date,
    endTime,
    allDay: !hasTime,
    location: typeof meta.location === "string" ? meta.location : undefined,
    alerts: Array.isArray(meta.alerts) ? (meta.alerts as AlertOffset[]) : [],
    travelTime: (meta.travelTime as TravelTime | undefined) ?? "none",
    invitees: Array.isArray(meta.invitees) ? (meta.invitees as Invitee[]) : [],
    availability: (meta.availability as Availability | undefined) ?? "busy",
    url: typeof meta.url === "string" ? meta.url : undefined,
    notes: item.description ?? undefined,
    attachments: Array.isArray(meta.attachments) ? (meta.attachments as EventAttachment[]) : [],
  };
}

export function calendarEventToAddInput(ev: CalendarEvent): {
  title: string;
  kind: "SIMPLE";
  itemType: LifeItemType;
  scheduledMinute?: number;
  durationMinutes?: number;
  area?: string;
  description?: string;
  metadata?: Record<string, unknown>;
} {
  const hasTime = !ev.allDay && !!ev.startTime;
  const durationMinutes = hasTime
    ? Math.max(
        15,
        ev.startDate === ev.endDate && ev.endTime
          ? hmToMinutes(ev.endTime) - hmToMinutes(ev.startTime!)
          : 60,
      )
    : undefined;
  const metadata: Record<string, unknown> = {};
  if (ev.location) metadata.location = ev.location;
  if (ev.alerts.length > 0) metadata.alerts = ev.alerts;
  if (ev.travelTime !== "none") metadata.travelTime = ev.travelTime;
  if (ev.invitees.length > 0) metadata.invitees = ev.invitees;
  if (ev.availability !== "busy") metadata.availability = ev.availability;
  if (ev.url) metadata.url = ev.url;
  if (ev.attachments.length > 0) metadata.attachments = ev.attachments;
  if (ev.endDate !== ev.startDate) metadata.endDate = ev.endDate;
  return {
    title: ev.title,
    kind: "SIMPLE",
    itemType: "EVENT",
    scheduledMinute: hasTime ? hmToMinutes(ev.startTime!) : undefined,
    durationMinutes,
    area: ev.calendar || undefined,
    description: ev.notes || undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

export function calendarEventToUpdateInput(ev: CalendarEvent): PlannerItemUpdateInput {
  const hasTime = !ev.allDay && !!ev.startTime;
  const durationMinutes = hasTime
    ? Math.max(
        15,
        ev.startDate === ev.endDate && ev.endTime
          ? hmToMinutes(ev.endTime) - hmToMinutes(ev.startTime!)
          : 60,
      )
    : null;
  const metadata: Record<string, unknown> = {};
  if (ev.location) metadata.location = ev.location;
  if (ev.alerts.length > 0) metadata.alerts = ev.alerts;
  if (ev.travelTime !== "none") metadata.travelTime = ev.travelTime;
  if (ev.invitees.length > 0) metadata.invitees = ev.invitees;
  if (ev.availability !== "busy") metadata.availability = ev.availability;
  if (ev.url) metadata.url = ev.url;
  if (ev.attachments.length > 0) metadata.attachments = ev.attachments;
  if (ev.endDate !== ev.startDate) metadata.endDate = ev.endDate;
  return {
    title: ev.title,
    scheduledMinute: hasTime ? hmToMinutes(ev.startTime!) : null,
    durationMinutes,
    area: ev.calendar || null,
    description: ev.notes || null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };
}

// ---------------------------------------------------------------------------
// Reminder <-> ApiPlannerItem.
// ---------------------------------------------------------------------------

export function apiItemToReminder(item: ApiPlannerItem): Reminder {
  const meta = item.metadata ?? {};
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  if (item.deadline) {
    const split = splitDeadline(item.deadline);
    dueDate = split.date;
    dueTime = split.time;
  } else if (item.scheduledMinute !== null) {
    dueDate = item.date;
    dueTime = minutesToHM(item.scheduledMinute);
  }
  return {
    id: item.id,
    title: item.title,
    completed: item.done,
    list: item.area || PLANNER_REMINDER_LISTS[0].name,
    dueDate,
    dueTime,
    remindOnDate: null,
    remindOnTime: null,
    location: null,
    priority: priorityToCalendar(item.priority),
    flagged: item.isFocus,
    tags: item.tags,
    subtasks: Array.isArray(meta.subtasks) ? (meta.subtasks as Subtask[]) : [],
    earlyReminder: (meta.earlyReminder as EarlyReminder | undefined) ?? "none",
    earlyReminderCustomMinutes:
      typeof meta.earlyReminderCustomMinutes === "number" ? meta.earlyReminderCustomMinutes : undefined,
    url: typeof meta.url === "string" ? meta.url : undefined,
    images: Array.isArray(meta.images) ? (meta.images as ReminderImage[]) : [],
    notes: item.description ?? undefined,
  };
}

function reminderMetadata(r: Reminder): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};
  if (r.subtasks.length > 0) metadata.subtasks = r.subtasks;
  if (r.earlyReminder !== "none") metadata.earlyReminder = r.earlyReminder;
  if (r.earlyReminderCustomMinutes) metadata.earlyReminderCustomMinutes = r.earlyReminderCustomMinutes;
  if (r.url) metadata.url = r.url;
  if (r.images.length > 0) metadata.images = r.images;
  return metadata;
}

export function reminderToAddInput(r: Reminder): {
  title: string;
  kind: "SIMPLE";
  itemType: LifeItemType;
  priority?: LifeItemPriority;
  isFocus?: boolean;
  area?: string;
  tags?: string[];
  deadline?: string;
  description?: string;
  metadata?: Record<string, unknown>;
} {
  const metadata = reminderMetadata(r);
  return {
    title: r.title,
    kind: "SIMPLE",
    itemType: "ACTION",
    priority: priorityFromCalendar(r.priority),
    isFocus: r.flagged,
    area: r.list || undefined,
    tags: r.tags.length > 0 ? r.tags : undefined,
    deadline: r.dueDate ? `${r.dueDate}T${r.dueTime ?? "09:00"}:00` : undefined,
    description: r.notes || undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

export function reminderToUpdateInput(r: Reminder): PlannerItemUpdateInput {
  const metadata = reminderMetadata(r);
  return {
    title: r.title,
    done: r.completed,
    priority: priorityFromCalendar(r.priority) ?? null,
    isFocus: r.flagged,
    area: r.list || null,
    tags: r.tags,
    deadline: r.dueDate ? `${r.dueDate}T${r.dueTime ?? "09:00"}:00` : null,
    description: r.notes || null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };
}
