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
};
