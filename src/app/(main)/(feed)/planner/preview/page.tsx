"use client";

// [2026-10-08] Trang DEMO/PREVIEW tam thoi - giup click-test TRUC TIEP tren
// trinh duyet 7 component macOS-style vua code trong phien lam viec nay
// (EventForm/ReminderForm/RecurrenceEditor/SharedCalendarForm/TaskTypePicker/
// TaskListView/CalendarView) - cac component nay DOC LAP, CHUA duoc gan vao
// /planner that (PlannerShell.tsx) nen KHONG the thay qua duong dan do.
// Trang nay dung du lieu MAU (khong goi backend that) - XOA duoc an toan khi
// khong con can nua (khong co gi phu thuoc vao no).

import { useState } from "react";
import { EventForm } from "@/components/planner/EventForm";
import { ReminderForm } from "@/components/planner/ReminderForm";
import { RecurrenceEditor, RecurrenceScopeDialog } from "@/components/planner/RecurrenceEditor";
import { SharedCalendarForm } from "@/components/planner/SharedCalendarForm";
import { TaskTypePicker, type TaskType } from "@/components/planner/TaskTypePicker";
import { TaskListView, type TaskItem } from "@/components/planner/TaskListView";
import { CalendarView } from "@/components/planner/CalendarView";
import type { CalendarEvent, Reminder, SharedCalendar, RecurrenceRule } from "@/components/planner/calendar-types";

const SAMPLE_CALENDARS = ["Personal", "Work", "Family"];
const SAMPLE_LISTS = [
  { name: "Personal", color: "#ff3b30", icon: "🏠" },
  { name: "Shopping", color: "#34c759", icon: "🛒" },
  { name: "Work", color: "#007aff", icon: "💼" },
];

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "ev1",
    title: "Design review",
    calendar: "Work",
    startDate: "2026-10-08",
    startTime: "09:00",
    endDate: "2026-10-08",
    endTime: "10:00",
    allDay: false,
    location: "Room 4B",
    alerts: ["15min"],
    travelTime: "none",
    invitees: [
      { id: "p1", email: "an@example.com", name: "An", status: "accepted", role: "required" },
      { id: "p2", email: "binh@example.com", name: "Bình", status: "pending", role: "optional" },
    ],
    availability: "busy",
    attachments: [],
  },
  {
    id: "ev2",
    title: "Team offsite",
    calendar: "Work",
    startDate: "2026-10-09",
    startTime: null,
    endDate: "2026-10-11",
    endTime: null,
    allDay: true,
    alerts: [],
    travelTime: "none",
    invitees: [],
    availability: "busy",
    attachments: [],
    recurrence: { frequency: "weekly", interval: 1, intervalUnit: "weeks", weekdays: [1], monthly: { mode: "day_of_month", day: 9 }, months: [10], end: { type: "never" } },
  },
  {
    id: "ev3",
    title: "Dentist appointment",
    calendar: "Personal",
    startDate: "2026-10-08",
    startTime: "14:00",
    endDate: "2026-10-08",
    endTime: "15:00",
    allDay: false,
    location: "123 Main St",
    alerts: ["1day"],
    travelTime: "30min",
    invitees: [],
    availability: "busy",
    attachments: [],
  },
];

const SAMPLE_REMINDERS: Reminder[] = [
  {
    id: "r1",
    title: "Buy groceries",
    completed: false,
    list: "Shopping",
    dueDate: "2026-10-08",
    dueTime: "18:00",
    remindOnDate: null,
    remindOnTime: null,
    location: null,
    priority: "medium",
    flagged: true,
    tags: ["home"],
    subtasks: [
      { id: "s1", title: "Milk", done: true },
      { id: "s2", title: "Eggs", done: false },
    ],
    earlyReminder: "none",
    images: [],
  },
  {
    id: "r2",
    title: "Finish quarterly report",
    completed: false,
    list: "Work",
    dueDate: "2026-10-10",
    dueTime: null,
    remindOnDate: null,
    remindOnTime: null,
    location: null,
    priority: "high",
    flagged: false,
    tags: ["urgent", "q4"],
    subtasks: [],
    earlyReminder: "1day",
    images: [],
  },
  {
    id: "r3",
    title: "Call mom",
    completed: true,
    list: "Personal",
    dueDate: "2026-10-07",
    dueTime: null,
    remindOnDate: null,
    remindOnTime: null,
    location: null,
    priority: "none",
    flagged: false,
    tags: [],
    subtasks: [],
    earlyReminder: "none",
    images: [],
  },
];

const SAMPLE_SHARED_CALENDAR: SharedCalendar = {
  id: "cal1",
  shareType: "calendar",
  name: "Family",
  color: "#ff9500",
  participants: [
    { id: "p0", userId: "me", email: "you@example.com", name: "You", isOwner: true, permission: "view_edit", status: "accepted" },
    { id: "p1", email: "spouse@example.com", name: "Spouse", isOwner: false, permission: "view_edit", status: "accepted" },
    { id: "p2", email: "kid@example.com", isOwner: false, permission: "view_only", status: "pending" },
  ],
  isPublic: false,
  notifyOnChanges: true,
};

type ModalKind = "event-create" | "event-edit" | "reminder-create" | "reminder-edit" | "shared-create" | "shared-manage" | null;

function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[12px] border border-[color:var(--planner-border-soft)] bg-white p-4">
      <h2 className="text-[14px] font-bold text-[color:var(--planner-text-primary)]">{title}</h2>
      {children}
    </section>
  );
}
function DemoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border border-[color:var(--planner-border)] bg-white px-3 py-2 text-[13px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
    >
      {label}
    </button>
  );
}

export default function PlannerComponentsPreviewPage() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(undefined);
  const [log, setLog] = useState<string[]>([]);
  const [listView, setListView] = useState<"by_date" | "by_list" | "by_priority">("by_date");
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week" | "day">("week");
  const [selectedDate, setSelectedDate] = useState("2026-10-08");
  const [reminders, setReminders] = useState(SAMPLE_REMINDERS);

  function pushLog(msg: string) {
    setLog((prev) => [msg, ...prev].slice(0, 6));
  }

  const taskItems: TaskItem[] = [
    ...SAMPLE_EVENTS.map((e): TaskItem => ({ type: "event", data: e })),
    ...reminders.map((r): TaskItem => ({ type: "reminder", data: r })),
  ];

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-5 p-6" style={{ fontFamily: "var(--planner-font-family)" }}>
      <div>
        <h1 className="text-[20px] font-bold text-[color:var(--planner-text-primary)]">Planner components — preview</h1>
        <p className="mt-1 text-[13px] text-[color:var(--planner-text-muted)]">
          Trang demo tạm, dữ liệu mẫu, không gọi backend thật. Có thể xoá khi không còn cần.
        </p>
      </div>

      {log.length > 0 && (
        <div className="rounded-[10px] border border-[color:var(--planner-border-soft)] bg-[var(--mset-surface-secondary)] p-3">
          <p className="mb-1 text-[11px] font-semibold text-[color:var(--planner-text-muted)] uppercase">Last actions</p>
          <ul className="flex flex-col gap-0.5 text-[12px] text-[color:var(--planner-text-secondary)]">
            {log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      <DemoSection title="EventForm / ReminderForm / SharedCalendarForm (modal)">
        <div className="flex flex-wrap gap-2">
          <DemoButton label="New Event" onClick={() => setModal("event-create")} />
          <DemoButton label="Edit Event" onClick={() => setModal("event-edit")} />
          <DemoButton label="New Reminder" onClick={() => setModal("reminder-create")} />
          <DemoButton label="Edit Reminder" onClick={() => setModal("reminder-edit")} />
          <DemoButton label="New Shared Calendar" onClick={() => setModal("shared-create")} />
          <DemoButton label="Manage Shared Calendar (owner)" onClick={() => setModal("shared-manage")} />
        </div>
      </DemoSection>

      <DemoSection title="RecurrenceEditor (inline) + RecurrenceScopeDialog">
        <RecurrenceEditor value={recurrence} onChange={setRecurrence} startDate={selectedDate} />
        <div>
          <DemoButton label="Open scope dialog (edit existing recurring event)" onClick={() => setScopeDialogOpen(true)} />
        </div>
      </DemoSection>

      <DemoSection title="TaskTypePicker">
        <div className="flex items-center gap-3">
          <TaskTypePicker onSelect={(t: TaskType) => pushLog(`TaskTypePicker → onSelect("${t}")`)} variant="icon" />
          <TaskTypePicker onSelect={(t: TaskType) => pushLog(`TaskTypePicker → onSelect("${t}")`)} variant="label" />
        </div>
      </DemoSection>

      <DemoSection title="TaskListView">
        <div className="flex gap-1.5">
          {(["by_date", "by_list", "by_priority"] as const).map((v) => (
            <DemoButton key={v} label={v} onClick={() => setListView(v)} />
          ))}
        </div>
        <div className="h-[420px] overflow-hidden rounded-[10px] border border-[color:var(--planner-border-soft)]">
          <TaskListView
            items={taskItems}
            view={listView}
            onItemClick={(it) => pushLog(`TaskListView → onItemClick(${it.data.title})`)}
            onReminderToggle={(id, completed) => {
              pushLog(`TaskListView → onReminderToggle(${id}, ${completed})`);
              setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed } : r)));
            }}
            onDelete={(it) => pushLog(`TaskListView → onDelete(${it.data.title})`)}
          />
        </div>
      </DemoSection>

      <DemoSection title="CalendarView">
        <div className="h-[560px] overflow-hidden rounded-[10px] border border-[color:var(--planner-border-soft)]">
          <CalendarView
            events={SAMPLE_EVENTS}
            reminders={reminders}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onEventClick={(ev) => pushLog(`CalendarView → onEventClick(${ev.title})`)}
            onSlotClick={(start, end) => pushLog(`CalendarView → onSlotClick(${start} → ${end})`)}
            view={calendarViewMode}
            onViewChange={setCalendarViewMode}
          />
        </div>
      </DemoSection>

      {modal === "event-create" && (
        <EventForm
          calendars={SAMPLE_CALENDARS}
          onSubmit={(e) => {
            pushLog(`EventForm → onSubmit(${e.title})`);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "event-edit" && (
        <EventForm
          event={SAMPLE_EVENTS[0]}
          calendars={SAMPLE_CALENDARS}
          onSubmit={(e) => {
            pushLog(`EventForm → onSubmit(${e.title})`);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
          onDelete={() => {
            pushLog("EventForm → onDelete()");
            setModal(null);
          }}
        />
      )}
      {modal === "reminder-create" && (
        <ReminderForm
          lists={SAMPLE_LISTS}
          knownTags={["work", "urgent", "home", "q4"]}
          onSubmit={(r) => {
            pushLog(`ReminderForm → onSubmit(${r.title})`);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "reminder-edit" && (
        <ReminderForm
          reminder={SAMPLE_REMINDERS[0]}
          lists={SAMPLE_LISTS}
          knownTags={["work", "urgent", "home", "q4"]}
          onSubmit={(r) => {
            pushLog(`ReminderForm → onSubmit(${r.title})`);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
          onDelete={() => {
            pushLog("ReminderForm → onDelete()");
            setModal(null);
          }}
        />
      )}
      {modal === "shared-create" && (
        <SharedCalendarForm
          currentUserId="me"
          onSubmit={(c) => {
            pushLog(`SharedCalendarForm → onSubmit(${c.name})`);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
          onInviteParticipant={(email) => pushLog(`SharedCalendarForm → onInviteParticipant(${email})`)}
        />
      )}
      {modal === "shared-manage" && (
        <SharedCalendarForm
          calendar={SAMPLE_SHARED_CALENDAR}
          currentUserId="me"
          onSubmit={(c) => {
            pushLog(`SharedCalendarForm → onSubmit(${c.name})`);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
          onDelete={() => {
            pushLog("SharedCalendarForm → onDelete()");
            setModal(null);
          }}
          onInviteParticipant={(email) => pushLog(`SharedCalendarForm → onInviteParticipant(${email})`)}
        />
      )}

      <RecurrenceScopeDialog
        open={scopeDialogOpen}
        onCancel={() => setScopeDialogOpen(false)}
        onThisEventOnly={() => {
          pushLog("RecurrenceScopeDialog → onThisEventOnly()");
          setScopeDialogOpen(false);
        }}
        onThisAndFuture={() => {
          pushLog("RecurrenceScopeDialog → onThisAndFuture()");
          setScopeDialogOpen(false);
        }}
        onAllEvents={() => {
          pushLog("RecurrenceScopeDialog → onAllEvents()");
          setScopeDialogOpen(false);
        }}
      />
    </div>
  );
}
