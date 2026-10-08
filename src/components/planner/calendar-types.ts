// [2026-10-08] Kieu du lieu RIENG cho EventForm.tsx (macOS Calendar style) -
// YEU CAU NGUOI DUNG: component nay DOC LAP voi model PlannerItem hien co
// (ApiPlannerItem/LifeItemType... trong src/lib/api/planner.ts) - khong phai
// 1 bien the cua Action/Event/Habit/Reflection, ma mo phong CHINH XAC 1 sự
// kiện kiểu app Calendar gốc của macOS (nhieu invitee, alert, travel time,
// availability...). KHONG import/tai dung type cua Planner o day - co chu y,
// tranh ep 2 mo hinh du lieu khac nhau vao chung 1 shape.

export type AlertOffset =
  | "none"
  | "5min"
  | "10min"
  | "15min"
  | "30min"
  | "1hour"
  | "2hours"
  | "1day"
  | "2days"
  | "1week";

export const ALERT_OFFSET_OPTIONS: { value: AlertOffset; label: string }[] = [
  { value: "none", label: "None" },
  { value: "5min", label: "5 minutes before" },
  { value: "10min", label: "10 minutes before" },
  { value: "15min", label: "15 minutes before" },
  { value: "30min", label: "30 minutes before" },
  { value: "1hour", label: "1 hour before" },
  { value: "2hours", label: "2 hours before" },
  { value: "1day", label: "1 day before" },
  { value: "2days", label: "2 days before" },
  { value: "1week", label: "1 week before" },
];

export type TravelTime = "none" | "5min" | "15min" | "30min" | "1hour" | "1.5hours";

export const TRAVEL_TIME_OPTIONS: { value: TravelTime; label: string }[] = [
  { value: "none", label: "None" },
  { value: "5min", label: "5 minutes" },
  { value: "15min", label: "15 minutes" },
  { value: "30min", label: "30 minutes" },
  { value: "1hour", label: "1 hour" },
  { value: "1.5hours", label: "1 hour 30 minutes" },
];

export type InviteeStatus = "accepted" | "declined" | "maybe" | "pending";
export type InviteeRole = "required" | "optional";

export type Invitee = {
  id: string;
  email: string;
  name?: string;
  status: InviteeStatus;
  role: InviteeRole;
};

export type EventAttachment = {
  id: string;
  fileName: string;
  // bytes.
  fileSize: number;
  url?: string;
};

export type Availability = "busy" | "free";

export type CalendarEvent = {
  id: string;
  title: string;
  // Phai khop 1 phan tu trong props.calendars (EventForm).
  calendar: string;
  // YYYY-MM-DD.
  startDate: string;
  // HH:MM (24h) - null khi allDay.
  startTime: string | null;
  endDate: string;
  endTime: string | null;
  allDay: boolean;
  location?: string;
  // Toi da 3 phan tu (xem EventForm - nut "+ Add Alert" tu khoa khi du 3).
  alerts: AlertOffset[];
  travelTime: TravelTime;
  invitees: Invitee[];
  availability: Availability;
  url?: string;
  notes?: string;
  attachments: EventAttachment[];
  // [2026-10-08] Them cho TaskListView.tsx ("Recurring icon nếu có
  // recurrence") - CHUA co o CalendarEvent goc luc EventForm duoc tao (truoc
  // khi RecurrenceEditor/RecurrenceRule ton tai). Type dinh nghia O DUOI file
  // nay (RecurrenceRule) - TypeScript hoist type declaration trong CUNG
  // module nen tham chieu NGUOC thu tu nay van hop le, khong can sap xep lai
  // vi tri cac type trong file.
  recurrence?: RecurrenceRule;
};

// ---------------------------------------------------------------------------
// [2026-10-08] Kieu du lieu RIENG cho ReminderForm.tsx (macOS Reminders
// style) - CUNG TRIET LY voi CalendarEvent o tren: DOC LAP hoan toan voi
// model PlannerItem, khong tai dung/ep chung shape.
// ---------------------------------------------------------------------------

export type Priority = "none" | "low" | "medium" | "high";

export const PRIORITY_CONFIG: Record<Priority, { label: string; mark: string; color: string }> = {
  none: { label: "None", mark: "", color: "var(--planner-text-muted)" },
  low: { label: "Low", mark: "!", color: "#1d9bf6" },
  medium: { label: "Medium", mark: "!!", color: "#ff9f0a" },
  high: { label: "High", mark: "!!!", color: "#ff3b30" },
};

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
  // Rieng cho TUNG subtask (hien khi expand) - doc lap voi due date/priority
  // cua chinh Reminder cha.
  dueDate?: string | null;
  priority?: Priority;
};

export type EarlyReminder =
  | "none"
  | "1day"
  | "2days"
  | "3days"
  | "1week"
  | "2weeks"
  | "custom";

export const EARLY_REMINDER_OPTIONS: { value: EarlyReminder; label: string }[] = [
  { value: "none", label: "None" },
  { value: "1day", label: "1 day before" },
  { value: "2days", label: "2 days before" },
  { value: "3days", label: "3 days before" },
  { value: "1week", label: "1 week before" },
  { value: "2weeks", label: "2 weeks before" },
  { value: "custom", label: "Custom" },
];

export type LocationTrigger = "arriving" | "leaving";

export type ReminderLocation = {
  // Ten/dia chi nguoi dung go/chon (khong goi API geocode that - xem comment
  // ReminderForm.tsx).
  query: string;
  trigger: LocationTrigger;
  // met, 100-500 (mac dinh 200) - xem Slider trong ReminderForm.
  radiusMeters: number;
};

export type ReminderImage = {
  id: string;
  // object URL (tao qua URL.createObjectURL o client, xem ReminderForm) -
  // component KHONG tu upload len server nao.
  url: string;
  fileName?: string;
};

export type Reminder = {
  id: string;
  title: string;
  completed: boolean;
  // Phai khop 1 phan tu trong props.lists (ReminderForm).
  list: string;
  // YYYY-MM-DD - null = chua bat "Add Date".
  dueDate: string | null;
  // HH:MM - null = chua bat "Add Time" (chi co y nghia khi dueDate != null).
  dueTime: string | null;
  // "Remind on a Date" - DOC LAP voi dueDate/dueTime o tren (vd due ngay 15
  // nhung nhac truoc vao ngay 13).
  remindOnDate: string | null;
  remindOnTime: string | null;
  location: ReminderLocation | null;
  priority: Priority;
  flagged: boolean;
  tags: string[];
  subtasks: Subtask[];
  // Chi co y nghia khi dueDate != null (xem ReminderForm).
  earlyReminder: EarlyReminder;
  earlyReminderCustomMinutes?: number;
  url?: string;
  images: ReminderImage[];
  notes?: string;
};

// ---------------------------------------------------------------------------
// [2026-10-08] Kieu du lieu RIENG cho RecurrenceEditor.tsx (macOS Calendar
// style) - CUNG triet ly voi CalendarEvent/Reminder o tren: DOC LAP hoan
// toan voi model PlannerItem. LUU Y: PlannerShell.tsx (QuickAddPopover) VON
// DA co 1 type CUNG TEN "RecurrenceRule" trong
// src/lib/planner/life-item-types.ts - shape DON GIAN HON NHIEU (chi
// {freq, customWeekdays?}), phuc vu rieng QuickAddPopover. Day la 1 type
// KHAC, o 1 MODULE KHAC (./calendar-types, khong phai
// lib/planner/life-item-types), phuc vu rieng RecurrenceEditor/EventForm/
// ReminderForm - KHONG duoc tron lan hay thay the lan nhau. Trung ten vi
// CA 2 deu mo ta "quy tac lap lai", nhung pham vi/do phuc tap khac nhau -
// neu sau nay can GOP 2 he thong lam MOT, do la 1 quyet dinh kien truc rieng
// (migration data + doi het noi dung o ca 2 phia), khong lam ngam trong task
// nay.
// ---------------------------------------------------------------------------

export type RepeatFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "custom";

export const REPEAT_FREQUENCY_OPTIONS: { value: RepeatFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

// 0=Sun..6=Sat - khop dung Date.getDay(), xuyen suot code Planner.
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type OrdinalWeek = "first" | "second" | "third" | "fourth" | "last";

export const ORDINAL_WEEK_OPTIONS: { value: OrdinalWeek; label: string }[] = [
  { value: "first", label: "first" },
  { value: "second", label: "second" },
  { value: "third", label: "third" },
  { value: "fourth", label: "fourth" },
  { value: "last", label: "last" },
];

export type RecurrenceIntervalUnit = "days" | "weeks" | "months" | "years";

// Monthly: 1 trong 2 che do loai tru nhau (radio trong RecurrenceEditor).
export type MonthlyMode =
  | { mode: "day_of_month"; day: number } // 1-31, hoac -1 = ngay cuoi thang
  | { mode: "ordinal_weekday"; ordinal: OrdinalWeek; weekday: DayOfWeek };

export type EndRepeatCondition =
  | { type: "never" }
  | { type: "after_count"; count: number }
  | { type: "on_date"; date: string }; // YYYY-MM-DD, phai > startDate

export type RecurrenceRule = {
  frequency: RepeatFrequency;
  // "Every [N] [unit]" - CHI hien/sua duoc tren UI khi frequency==="custom",
  // nhung LUU luon o moi frequency (vd weekly ngam dinh {1,"weeks"},
  // biweekly {2,"weeks"}) de logic preview/tinh toan dong nhat 1 cho, khong
  // phai rai nhanh if theo tung frequency o noi khac dung rule nay.
  interval: number;
  intervalUnit: RecurrenceIntervalUnit;
  // weekly/biweekly/custom(unit=weeks): it nhat 1 phan tu (xem Validation).
  weekdays: DayOfWeek[];
  // monthly.
  monthly: MonthlyMode;
  // yearly: 1-12.
  months: number[];
  end: EndRepeatCondition;
};

// ---------------------------------------------------------------------------
// [2026-10-08] Kieu du lieu RIENG cho SharedCalendarForm.tsx (macOS Calendar
// sharing style) - CUNG triet ly DOC LAP voi CalendarEvent/Reminder/
// RecurrenceRule o tren.
// ---------------------------------------------------------------------------

export type Permission = "view_only" | "view_edit";

export const PERMISSION_OPTIONS: { value: Permission; label: string }[] = [
  { value: "view_only", label: "View Only" },
  { value: "view_edit", label: "View & Edit" },
];

export type ParticipantStatus = "accepted" | "pending" | "declined";

export type Participant = {
  id: string;
  // Apple ID - so khop voi `currentUserId` (SharedCalendarFormProps) de xac
  // dinh "day co phai chinh minh/chu so huu khong". Co the CHUA co (undefined)
  // voi 1 loi moi dang "pending" ma nguoi nhan chua tung dang nhap/chap nhan.
  userId?: string;
  email: string;
  name?: string;
  isOwner: boolean;
  permission: Permission;
  status: ParticipantStatus;
};

export type ShareType = "calendar" | "reminder_list";

// 12 mau preset (grid 6x2) - xem SharedCalendarForm "Color picker".
export const SHARE_COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Red", hex: "#ff3b30" },
  { name: "Orange", hex: "#ff9500" },
  { name: "Yellow", hex: "#ffcc00" },
  { name: "Green", hex: "#34c759" },
  { name: "Teal", hex: "#30b0c7" },
  { name: "Blue", hex: "#007aff" },
  { name: "Indigo", hex: "#5856d6" },
  { name: "Purple", hex: "#af52de" },
  { name: "Pink", hex: "#ff2d55" },
  { name: "Brown", hex: "#a2845e" },
  { name: "Gray", hex: "#8e8e93" },
  { name: "Graphite", hex: "#48484a" },
];

export type SharedCalendar = {
  id: string;
  // "Sau khi tạo không thể đổi" - chi hien UI chon o CREATE mode.
  shareType: ShareType;
  name: string;
  // Hex - 1 trong SHARE_COLOR_PRESETS hoac custom nguoi dung tu nhap.
  color: string;
  // Bao gom CA owner (1 phan tu isOwner:true duy nhat trong mang).
  participants: Participant[];
  isPublic: boolean;
  // Chi co y nghia khi isPublic true.
  publicUrl?: string;
  notifyOnChanges: boolean;
};
