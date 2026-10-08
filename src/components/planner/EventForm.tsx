"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Bell,
  Car,
  Link2,
  Paperclip,
  UserPlus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pad2,
  todayISO,
  roundedNowHM,
  isValidUrl,
  isValidEmail,
  formatFileSize,
  randomId,
  FormInput,
  FieldLabel,
  GhostAddButton,
  ToggleSwitch,
  InlineSelect,
  DeleteConfirmPopover,
} from "./macos-form-controls";
import {
  ALERT_OFFSET_OPTIONS,
  TRAVEL_TIME_OPTIONS,
  type CalendarEvent,
  type AlertOffset,
  type Availability,
  type Invitee,
  type InviteeRole,
  type EventAttachment,
} from "./calendar-types";

// [2026-10-08] EventForm - modal tao/sua 1 CalendarEvent theo dung spec
// nguoi dung gui ("Code component EventForm (modal) theo macOS Calendar
// style"). COMPONENT DOC LAP voi model PlannerItem hien co cua Planner (xem
// comment dau calendar-types.ts) - KHONG goi backend/server action nao,
// thuan "controlled component": nhan `event`/`calendars` qua props, tra ket
// qua qua `onSubmit`/`onCancel`/`onDelete`, noi goi no tu quyet dinh luu o
// dau. Style theo he thong da chot o docs/planner-macos-design-system.md
// (--mset-*/--planner-* token, modal glass+blur, dropdown khong native...).
//
// KHONG co prop `open`/`onOpenChange` rieng (dung spec Props nguoi dung dua,
// chi co `event?`/`calendars`/`onSubmit`/`onCancel`/`onDelete?`) - giong quy
// uoc QuickAddPopover da dung trong PlannerShell.tsx: noi goi CHI mount
// <EventForm /> khi can hien, Dialog.Root ben trong luon `open` tinh.

function addHourHM(hm: string): string {
  const [h, m] = hm.split(":").map(Number);
  return `${pad2((h + 1) % 24)}:${pad2(m)}`;
}

const CALENDAR_DOT_PALETTE = [
  "#007aff",
  "#ff9f0a",
  "#34c759",
  "#bf57da",
  "#fb0055",
  "#1d9bf6",
];
function colorForCalendar(name: string, calendars: string[]): string {
  const idx = Math.max(0, calendars.indexOf(name));
  return CALENDAR_DOT_PALETTE[idx % CALENDAR_DOT_PALETTE.length];
}

const INVITEE_STATUS_STYLE: Record<Invitee["status"], { label: string; color: string; bg: string }> = {
  accepted: { label: "Accepted", color: "var(--mset-success)", bg: "rgba(52,199,89,.12)" },
  declined: { label: "Declined", color: "var(--mset-danger)", bg: "rgba(255,59,48,.12)" },
  maybe: { label: "Maybe", color: "var(--mset-warning)", bg: "rgba(255,159,10,.12)" },
  pending: { label: "Pending", color: "var(--mset-text-tertiary)", bg: "rgba(0,0,0,.06)" },
};

function InviteeChip({
  invitee,
  onRemove,
  onToggleRole,
}: {
  invitee: Invitee;
  onRemove: () => void;
  onToggleRole: () => void;
}) {
  const statusCfg = INVITEE_STATUS_STYLE[invitee.status];
  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-[color:var(--planner-text-primary)]">
          {invitee.name || invitee.email}
        </p>
        {invitee.name && (
          <p className="truncate text-[11px] text-[color:var(--planner-text-muted)]">{invitee.email}</p>
        )}
      </div>
      <span
        className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
        style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
      >
        {statusCfg.label}
      </span>
      <button
        type="button"
        onClick={onToggleRole}
        title="Toggle required/optional"
        className="shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--planner-text-secondary)]"
      >
        {invitee.role === "required" ? "Required" : "Optional"}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove invitee"
        className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--mset-danger)]"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function AttachmentRow({ file, onRemove }: { file: EventAttachment; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2 py-1.5">
      <Paperclip size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-[color:var(--planner-text-primary)]">
          {file.fileName}
        </p>
        <p className="text-[11px] text-[color:var(--planner-text-muted)]">{formatFileSize(file.fileSize)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attachment"
        className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--mset-danger)]"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function EventForm({
  event,
  initialDraft,
  calendars,
  onSubmit,
  onCancel,
  onDelete,
}: {
  event?: CalendarEvent;
  // [2026-10-08] Gieo san gia tri (vd gio vua KEO THA tren luoi) khi TAO MOI
  // (khong co `event`) - KHAC voi truyen 1 `event` day du, prop nay KHONG
  // bat `isEdit` (van la "New Event", KHONG hien nut Delete). Chi doc luc
  // KHOI TAO state (khong dong bo lai sau, giong dung cach `event` hoat dong).
  initialDraft?: Partial<Pick<CalendarEvent, "startDate" | "startTime" | "endDate" | "endTime" | "calendar">>;
  calendars: string[];
  onSubmit: (event: CalendarEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [calendar, setCalendar] = useState(event?.calendar ?? initialDraft?.calendar ?? calendars[0] ?? "");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startDate, setStartDate] = useState(event?.startDate ?? initialDraft?.startDate ?? todayISO());
  const [startTime, setStartTime] = useState(event?.startTime ?? initialDraft?.startTime ?? roundedNowHM());
  const [endDate, setEndDate] = useState(
    event?.endDate ?? event?.startDate ?? initialDraft?.endDate ?? initialDraft?.startDate ?? todayISO(),
  );
  const [endTime, setEndTime] = useState(
    event?.endTime ?? initialDraft?.endTime ?? addHourHM(event?.startTime ?? initialDraft?.startTime ?? roundedNowHM()),
  );
  const [locationOpen, setLocationOpen] = useState(!!event?.location);
  const [location, setLocation] = useState(event?.location ?? "");
  const [alerts, setAlerts] = useState<AlertOffset[]>(event?.alerts ?? []);
  const [travelTime, setTravelTime] = useState<(typeof TRAVEL_TIME_OPTIONS)[number]["value"]>(
    event?.travelTime ?? "none",
  );
  const [invitees, setInvitees] = useState<Invitee[]>(event?.invitees ?? []);
  const [inviteeInput, setInviteeInput] = useState("");
  const [inviteeError, setInviteeError] = useState(false);
  const [availability, setAvailability] = useState<Availability>(event?.availability ?? "busy");
  const [url, setUrl] = useState(event?.url ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [attachments, setAttachments] = useState<EventAttachment[]>(event?.attachments ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // [2026-10-08] "endDate >= startDate, nếu không tự động chỉnh endDate" -
  // spec nguoi dung. Sua NGAY trong handler onChange cua startDate (khong
  // phai 1 useEffect rieng doc endDate - setState dong bo trong effect de
  // "dong bo 2 state" bi chinh React flag la anti-pattern, de gay cascading
  // render; xu ly truc tiep trong SU KIEN gay ra thay doi la dung cach hon).
  function handleStartDateChange(next: string) {
    setStartDate(next);
    setEndDate((d) => (d < next ? next : d));
  }

  // Dialog.Content DOM node - forward lam `container` cho moi DropdownMenu/
  // Popover LONG BEN TRONG (Calendar/Alert/Travel Time select) - xem comment
  // chi tiet o ui/popover.tsx + ui/dropdown-menu.tsx (Dialog modal + Focus
  // Scope "trapped" giut focus khoi Portal mac dinh document.body).
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  const titleValid = title.trim().length > 0;
  const urlValid = isValidUrl(url);
  const canSubmit = titleValid && urlValid;

  function addAlert() {
    if (alerts.length >= 3) return;
    setAlerts((prev) => [...prev, "15min"]);
  }
  function updateAlert(index: number, value: AlertOffset) {
    setAlerts((prev) => prev.map((a, i) => (i === index ? value : a)));
  }
  function removeAlert(index: number) {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  }

  function addInvitee() {
    const raw = inviteeInput.trim();
    if (!raw) return;
    if (!isValidEmail(raw)) {
      setInviteeError(true);
      return;
    }
    setInvitees((prev) => [
      ...prev,
      { id: randomId(), email: raw, status: "pending", role: "required" },
    ]);
    setInviteeInput("");
    setInviteeError(false);
  }
  function removeInvitee(id: string) {
    setInvitees((prev) => prev.filter((i) => i.id !== id));
  }
  function toggleInviteeRole(id: string) {
    setInvitees((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, role: (i.role === "required" ? "optional" : "required") as InviteeRole }
          : i,
      ),
    );
  }

  function handleFilesPicked(files: FileList | null) {
    if (!files) return;
    setAttachments((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({
        id: randomId(),
        fileName: f.name,
        fileSize: f.size,
      })),
    ]);
  }
  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      id: event?.id ?? randomId(),
      title: title.trim(),
      calendar,
      startDate,
      startTime: allDay ? null : startTime,
      endDate,
      endTime: allDay ? null : endTime,
      allDay,
      location: location.trim() || undefined,
      alerts,
      travelTime,
      invitees,
      availability,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      attachments,
    });
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onCancel()}>
      <AnimatePresence>
        <Dialog.Portal forceMount>
          {/* Backdrop - xem docs/planner-macos-design-system.md "Modal". */}
          <Dialog.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(0,0,0,.18)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            />
          </Dialog.Overlay>
          {/* [2026-10-08] "Animation: slide-up khi mở, fade-out khi đóng" -
              yeu cau nguoi dung. Outer div (asChild target cua Dialog.Content,
              nhan ref) CHI lo dinh vi giua man hinh TINH (top/left 50% +
              -translate 50%) - KHONG the animate truc tiep tren no vi se xung
              dot voi chinh transform dung de CAN GIUA. motion.div BEN TRONG
              rieng, tach biet, dam nhan hoan toan hieu ung truot-len/mo-dan -
              2 transform (cua div ngoai vs cua motion.div trong) stack doc
              lap, khong triet tieu nhau. */}
          <Dialog.Content
            ref={setContentEl}
            asChild
            forceMount
            onOpenAutoFocus={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex max-h-[min(760px,85vh)] w-[min(640px,calc(100vw-48px))] flex-col overflow-hidden"
                style={{
                  background: "rgba(255,255,255,.96)",
                  border: "1px solid rgba(255,255,255,.8)",
                  borderRadius: 18,
                  boxShadow: "0 32px 80px rgba(0,0,0,.14), 0 8px 24px rgba(0,0,0,.08)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  fontFamily: "var(--planner-font-family)",
                }}
              >
                <Dialog.Title asChild>
                  {/* Header: Cancel (trai) | title (giua) | Save (phai) +
                      Delete icon rieng (chi edit mode) truoc Cancel - spec:
                      "nut Cancel (trái), nút Save (phải, primary)". */}
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--mset-divider)] px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isEdit && onDelete && (
                        <DeleteConfirmPopover label="Delete event" onConfirm={onDelete} />
                      )}
                      <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                      >
                        Cancel
                      </button>
                    </div>
                    <span className="truncate text-[14px] font-semibold text-[color:var(--planner-text-primary)]">
                      {isEdit ? "Edit Event" : "New Event"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="cursor-pointer rounded-[8px] bg-[color:var(--planner-primary)] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(0,122,255,.22)] transition-colors duration-150 ease-out hover:bg-[#006fe6] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                    >
                      Save
                    </button>
                  </div>
                </Dialog.Title>

                {/* Body - scroll rieng, khong keo theo header/footer. */}
                <div className="mset-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
                  <FormInput
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="h-11 text-[15px] font-medium"
                  />

                  {/* Date & Time. */}
                  <div className="flex flex-col gap-3 rounded-[10px] border border-[color:var(--planner-border-soft)] p-3.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>All day</FieldLabel>
                      <ToggleSwitch checked={allDay} onChange={setAllDay} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-1.5">
                      <FieldLabel>Starts</FieldLabel>
                      <FormInput
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                      />
                      {!allDay && (
                        <FormInput
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-1.5">
                      <FieldLabel>Ends</FieldLabel>
                      <FormInput
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      {!allDay && (
                        <FormInput
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Location - ghost row, giong QuickAddPopover. */}
                  {location || locationOpen ? (
                    <div className="flex items-center gap-2 rounded-[8px] border border-[color:var(--planner-border-soft)] px-2.5">
                      <MapPin size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                      <input
                        autoFocus={locationOpen && !location}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onBlur={() => {
                          if (!location.trim()) setLocationOpen(false);
                        }}
                        placeholder="Location"
                        className="h-9 flex-1 bg-transparent text-[13px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)]"
                      />
                    </div>
                  ) : (
                    <GhostAddButton icon={MapPin} label="Add Location" onClick={() => setLocationOpen(true)} />
                  )}

                  {/* Calendar selector. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Calendar</FieldLabel>
                    <InlineSelect
                      value={calendar}
                      options={calendars.map((c) => ({ value: c, label: c }))}
                      onChange={setCalendar}
                      container={contentEl}
                      renderDot={(v) => colorForCalendar(v, calendars)}
                    />
                  </div>

                  {/* Alerts. */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Alert</FieldLabel>
                      {alerts.length < 3 && (
                        <button
                          type="button"
                          onClick={addAlert}
                          className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-[color:var(--planner-primary)] hover:underline"
                        >
                          <Plus size={12} /> Add Alert
                        </button>
                      )}
                    </div>
                    {alerts.length === 0 ? (
                      <InlineSelect
                        value="none"
                        options={ALERT_OFFSET_OPTIONS}
                        onChange={(v) => setAlerts(v === "none" ? [] : [v])}
                        container={contentEl}
                      />
                    ) : (
                      alerts.map((a, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Bell size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                          <div className="flex-1">
                            <InlineSelect
                              value={a}
                              options={ALERT_OFFSET_OPTIONS}
                              onChange={(v) => updateAlert(i, v)}
                              container={contentEl}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAlert(i)}
                            aria-label="Remove alert"
                            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--mset-danger)]"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Travel Time - chi hien khi co location. */}
                  {!!location.trim() && (
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Travel Time</FieldLabel>
                      <div className="flex items-center gap-1.5">
                        <Car size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                        <div className="flex-1">
                          <InlineSelect
                            value={travelTime}
                            options={TRAVEL_TIME_OPTIONS}
                            onChange={setTravelTime}
                            container={contentEl}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invitees. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Invitees</FieldLabel>
                    <div className="flex items-center gap-1.5">
                      <UserPlus size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                      <FormInput
                        value={inviteeInput}
                        onChange={(e) => {
                          setInviteeInput(e.target.value);
                          setInviteeError(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInvitee();
                          }
                        }}
                        placeholder="Add invitee by email, press Enter"
                        className={cn(inviteeError && "border-[color:var(--mset-danger)]")}
                      />
                    </div>
                    {inviteeError && (
                      <p className="pl-5 text-[11px]" style={{ color: "var(--mset-danger)" }}>
                        Enter a valid email address.
                      </p>
                    )}
                    {invitees.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {invitees.map((inv) => (
                          <InviteeChip
                            key={inv.id}
                            invitee={inv}
                            onRemove={() => removeInvitee(inv.id)}
                            onToggleRole={() => toggleInviteeRole(inv.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Availability. */}
                  <div className="flex items-center justify-between">
                    <FieldLabel>Availability</FieldLabel>
                    <div
                      className="inline-flex"
                      style={{
                        padding: 2,
                        background: "var(--mset-surface-tertiary)",
                        border: "1px solid rgba(0,0,0,.06)",
                        borderRadius: 9,
                      }}
                    >
                      {(["busy", "free"] as Availability[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAvailability(v)}
                          className="h-7 cursor-pointer rounded-[7px] border-0 px-3 text-xs font-medium capitalize outline-none transition-[background-color,box-shadow] duration-150 ease-out"
                          style={{
                            background: availability === v ? "#ffffff" : "transparent",
                            color:
                              availability === v
                                ? "var(--mset-text-primary)"
                                : "var(--mset-text-secondary)",
                            boxShadow:
                              availability === v
                                ? "0 1px 3px rgba(0,0,0,.10), 0 0 0 0.5px rgba(0,0,0,.04)"
                                : "none",
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>URL</FieldLabel>
                    <div className="flex items-center gap-1.5">
                      <Link2 size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                      <FormInput
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL or meeting link"
                        className={cn(!urlValid && "border-[color:var(--mset-danger)]")}
                      />
                    </div>
                    {!urlValid && (
                      <p className="pl-5 text-[11px]" style={{ color: "var(--mset-danger)" }}>
                        Enter a valid URL.
                      </p>
                    )}
                  </div>

                  {/* Notes - auto-expand. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      ref={notesRef}
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        const el = notesRef.current;
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      placeholder="Notes"
                      rows={2}
                      className="w-full resize-none rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 py-2 text-[13px] text-[color:var(--planner-text-primary)] outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-[color:var(--planner-text-muted)] focus:border-[color:var(--planner-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,255,.12)]"
                    />
                  </div>

                  {/* Attachments. */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Attachments</FieldLabel>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-[color:var(--planner-primary)] hover:underline"
                      >
                        <Paperclip size={12} /> Add Attachment
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleFilesPicked(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    {attachments.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {attachments.map((f) => (
                          <AttachmentRow key={f.id} file={f} onRemove={() => removeAttachment(f.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </AnimatePresence>
    </Dialog.Root>
  );
}
