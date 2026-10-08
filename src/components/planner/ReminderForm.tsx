"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Check,
  ChevronRight,
  MapPin,
  Flag,
  Hash,
  Plus,
  GripVertical,
  Bell,
  Link2,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  todayISO,
  roundedNowHM,
  isValidUrl,
  randomId,
  FormInput,
  FieldLabel,
  GhostAddButton,
  ToggleSwitch,
  InlineSelect,
  DeleteConfirmPopover,
} from "./macos-form-controls";
import {
  EARLY_REMINDER_OPTIONS,
  PRIORITY_CONFIG,
  type Reminder,
  type Priority,
  type Subtask,
  type EarlyReminder,
  type LocationTrigger,
  type ReminderImage,
} from "./calendar-types";

// [2026-10-08] ReminderForm - modal tao/sua 1 Reminder theo dung spec nguoi
// dung gui ("Code component ReminderForm (modal) theo macOS Reminders
// style"). CUNG triet ly voi EventForm.tsx (component DOC LAP, controlled,
// khong goi backend) - tai dung CHUNG bo primitive trong
// macos-form-controls.tsx de dong bo UI + tranh lap code giua 2 form. Xem
// docs/planner-macos-design-system.md.
//
// [2026-10-08] Gioi han CO Y THUC, flag ro (khong ngam hieu la "lam xong
// het"):
// - "Drag handle de sap xep thu tu" subtask: CHI ve icon GripVertical, CHUA
//   co logic keo-tha THAT (repo chua co san thu vien drag-and-drop nao, them
//   moi chi cho 1 danh sach subtask la qua lon so voi pham vi "code component
//   nay"). Sap xep van lam duoc qua... (hien KHONG co nut len/xuong thay the -
//   can yeu cau rieng neu muon 1 trong 2 huong nay).
// - "Mini map preview" o Remind at Location: KHONG goi API ban do that (vd
//   Google Maps/Mapbox) - chi 1 khung placeholder tinh (grid + ghim vi tri),
//   dung spec ghi "(optional)".
// - Anh trong "Images": dung URL.createObjectURL() TRÊN CLIENT de preview
//   (khong tu upload len server nao) - file That (ReminderImage.url) la 1
//   object URL CHI SONG trong phien duyet hien tai, se mat khi reload trang.
//   Can wiring upload that (vd tai dung uploadChatAttachmentAction nhu
//   QuickAddPopover) khi tich hop component nay vao luong that.

function minutesFromEarlyReminder(v: EarlyReminder, custom?: number): number {
  switch (v) {
    case "1day":
      return 1440;
    case "2days":
      return 2880;
    case "3days":
      return 4320;
    case "1week":
      return 10080;
    case "2weeks":
      return 20160;
    case "custom":
      return custom ?? 0;
    default:
      return 0;
  }
}

function PriorityPicker({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) {
  const levels: Priority[] = ["none", "low", "medium", "high"];
  return (
    <div className="flex items-center gap-1">
      {levels.map((p) => {
        const cfg = PRIORITY_CONFIG[p];
        const selected = value === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(selected ? "none" : p)}
            title={cfg.label}
            className="flex h-8 min-w-[42px] cursor-pointer items-center justify-center rounded-[8px] border px-2 text-[13px] font-bold transition-colors duration-150 ease-out"
            style={{
              borderColor: selected ? cfg.color : "var(--planner-border-soft)",
              backgroundColor: selected ? `${cfg.color}1A` : "white",
              color: p === "none" ? "var(--planner-text-muted)" : cfg.color,
            }}
          >
            {p === "none" ? (
              <span className="text-[11px] font-medium">None</span>
            ) : (
              cfg.mark
            )}
          </button>
        );
      })}
    </div>
  );
}

function TagChip({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-[color:var(--planner-primary-soft)] py-1 pr-1 pl-2.5 text-[12px] font-medium text-[color:var(--planner-primary)]">
      #{tag}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove tag ${tag}`}
        className="flex size-4 cursor-pointer items-center justify-center rounded-full hover:bg-white/60"
      >
        <X size={10} />
      </button>
    </span>
  );
}

function SubtaskRow({
  subtask,
  onChange,
  onRemove,
  onEnter,
}: {
  subtask: Subtask;
  onChange: (next: Subtask) => void;
  onRemove: () => void;
  onEnter: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 rounded-[8px] border border-[color:var(--planner-border-soft)] p-1.5">
      <div className="flex items-center gap-1.5">
        <span className="flex size-5 shrink-0 cursor-grab items-center justify-center text-[color:var(--planner-text-muted)]">
          <GripVertical size={13} />
        </span>
        <button
          type="button"
          role="checkbox"
          aria-checked={subtask.done}
          onClick={() => onChange({ ...subtask, done: !subtask.done })}
          className="grid size-[16px] shrink-0 cursor-pointer place-items-center rounded-full border transition-colors duration-150 ease-out"
          style={{
            borderColor: subtask.done ? "var(--planner-primary)" : "#c7c7cc",
            background: subtask.done ? "var(--planner-primary)" : "white",
          }}
        >
          {subtask.done && <Check size={10} strokeWidth={3} className="text-white" />}
        </button>
        <input
          value={subtask.title}
          onChange={(e) => onChange({ ...subtask, title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          placeholder="Subtask"
          className={cn(
            "h-7 min-w-0 flex-1 bg-transparent text-[12.5px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)]",
            subtask.done && "text-[color:var(--planner-text-muted)] line-through",
          )}
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label="Expand subtask options"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)]"
        >
          <ChevronRight size={13} className={cn("transition-transform duration-150", expanded && "rotate-90")} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove subtask"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--mset-danger)]"
        >
          <X size={13} />
        </button>
      </div>
      {expanded && (
        <div className="flex items-center gap-1.5 pl-[26px]">
          <FormInput
            type="date"
            value={subtask.dueDate ?? ""}
            onChange={(e) => onChange({ ...subtask, dueDate: e.target.value || null })}
            className="h-7 text-[11.5px]"
          />
          <PriorityPicker
            value={subtask.priority ?? "none"}
            onChange={(p) => onChange({ ...subtask, priority: p })}
          />
        </div>
      )}
    </div>
  );
}

function ImageThumb({
  image,
  onRemove,
  onOpen,
}: {
  image: ReminderImage;
  onRemove: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="group relative size-16 shrink-0 overflow-hidden rounded-[8px] border border-[color:var(--planner-border-soft)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- object URL client-side, khong phai asset tinh qua next/image */}
      <img
        src={image.url}
        alt={image.fileName ?? "Attached image"}
        onClick={onOpen}
        className="size-full cursor-pointer object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute top-0.5 right-0.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export function ReminderForm({
  reminder,
  lists,
  onSubmit,
  onCancel,
  onDelete,
  knownTags = [],
}: {
  reminder?: Reminder;
  lists: Array<{ name: string; color: string; icon?: string }>;
  onSubmit: (reminder: Reminder) => void;
  onCancel: () => void;
  onDelete?: () => void;
  // "Auto-suggest từ các tag đã dùng trước đó (props có thể truyền)" - spec.
  knownTags?: string[];
}) {
  const isEdit = !!reminder;
  const [completed, setCompleted] = useState(reminder?.completed ?? false);
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [list, setList] = useState(reminder?.list ?? lists[0]?.name ?? "");

  const [hasDate, setHasDate] = useState(!!reminder?.dueDate);
  const [dueDate, setDueDate] = useState(reminder?.dueDate ?? todayISO());
  const [hasTime, setHasTime] = useState(!!reminder?.dueTime);
  const [dueTime, setDueTime] = useState(reminder?.dueTime ?? roundedNowHM());

  const [hasRemindOnDate, setHasRemindOnDate] = useState(!!reminder?.remindOnDate);
  const [remindOnDate, setRemindOnDate] = useState(reminder?.remindOnDate ?? todayISO());
  const [remindOnTime, setRemindOnTime] = useState(reminder?.remindOnTime ?? roundedNowHM());

  const [hasLocation, setHasLocation] = useState(!!reminder?.location);
  const [locationQuery, setLocationQuery] = useState(reminder?.location?.query ?? "");
  const [locationTrigger, setLocationTrigger] = useState<LocationTrigger>(
    reminder?.location?.trigger ?? "arriving",
  );
  const [locationRadius, setLocationRadius] = useState(reminder?.location?.radiusMeters ?? 200);

  const [priority, setPriority] = useState<Priority>(reminder?.priority ?? "none");
  const [flagged, setFlagged] = useState(reminder?.flagged ?? false);

  const [tags, setTags] = useState<string[]>(reminder?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestOpen, setTagSuggestOpen] = useState(false);

  const [subtasks, setSubtasks] = useState<Subtask[]>(reminder?.subtasks ?? []);
  const subtaskInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const [earlyReminder, setEarlyReminder] = useState<EarlyReminder>(
    reminder?.earlyReminder ?? "none",
  );
  const [earlyReminderCustomMinutes, setEarlyReminderCustomMinutes] = useState(
    reminder?.earlyReminderCustomMinutes ?? 60,
  );

  const [url, setUrl] = useState(reminder?.url ?? "");
  const [images, setImages] = useState<ReminderImage[]>(reminder?.images ?? []);
  const [lightboxImage, setLightboxImage] = useState<ReminderImage | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState(reminder?.notes ?? "");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  const titleValid = title.trim().length > 0;
  const urlValid = isValidUrl(url);
  const canSubmit = titleValid && urlValid;

  const filteredTagSuggestions = knownTags.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.trim().toLowerCase()) &&
      tagInput.trim().length > 0 &&
      !tags.includes(t),
  );

  function addTag(raw: string) {
    const t = raw.trim().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
    setTagSuggestOpen(false);
  }
  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function addSubtask() {
    const id = randomId();
    setSubtasks((prev) => [...prev, { id, title: "", done: false }]);
    requestAnimationFrame(() => subtaskInputsRef.current[id]?.focus());
  }
  function updateSubtask(id: string, next: Subtask) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? next : s)));
  }
  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }
  function insertSubtaskAfter(id: string) {
    const newId = randomId();
    setSubtasks((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, { id: newId, title: "", done: false });
      return next;
    });
    requestAnimationFrame(() => subtaskInputsRef.current[newId]?.focus());
  }

  function handleImagesPicked(files: FileList | null) {
    if (!files) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({
        id: randomId(),
        url: URL.createObjectURL(f),
        fileName: f.name,
      })),
    ]);
  }
  function removeImage(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      id: reminder?.id ?? randomId(),
      title: title.trim(),
      completed,
      list,
      dueDate: hasDate ? dueDate : null,
      dueTime: hasDate && hasTime ? dueTime : null,
      remindOnDate: hasRemindOnDate ? remindOnDate : null,
      remindOnTime: hasRemindOnDate ? remindOnTime : null,
      location: hasLocation
        ? { query: locationQuery.trim(), trigger: locationTrigger, radiusMeters: locationRadius }
        : null,
      priority,
      flagged,
      tags,
      subtasks: subtasks.filter((s) => s.title.trim().length > 0),
      earlyReminder: hasDate ? earlyReminder : "none",
      earlyReminderCustomMinutes:
        hasDate && earlyReminder === "custom" ? earlyReminderCustomMinutes : undefined,
      url: url.trim() || undefined,
      images,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onCancel()}>
      <AnimatePresence>
        <Dialog.Portal forceMount>
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
          {/* Slide-up/fade - xem comment chi tiet tuong duong o EventForm.tsx
              (cung pattern: outer div tinh lo can giua, motion.div trong rieng
              lo hieu ung). */}
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
                className="flex max-h-[min(780px,85vh)] w-[min(640px,calc(100vw-48px))] flex-col overflow-hidden"
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
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--mset-divider)] px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isEdit && onDelete && (
                        <DeleteConfirmPopover label="Delete reminder" onConfirm={onDelete} />
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
                      {isEdit ? "Edit Reminder" : "New Reminder"}
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

                <div className="mset-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
                  {/* "Completed state: khi edit, hien checkbox 'Mark as
                      Complete' o tren cung" - spec. */}
                  {isEdit && (
                    <label className="flex cursor-pointer items-center gap-2">
                      <span
                        role="checkbox"
                        aria-checked={completed}
                        onClick={() => setCompleted((v) => !v)}
                        className="grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-full border transition-colors duration-150 ease-out"
                        style={{
                          borderColor: completed ? "var(--planner-primary)" : "#c7c7cc",
                          background: completed ? "var(--planner-primary)" : "white",
                        }}
                      >
                        {completed && <Check size={11} strokeWidth={3} className="text-white" />}
                      </span>
                      <span className="text-[13px] font-medium text-[color:var(--planner-text-primary)]">
                        Mark as Complete
                      </span>
                    </label>
                  )}

                  <FormInput
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Reminder"
                    className="h-11 text-[15px] font-medium"
                  />

                  {/* List selector. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>List</FieldLabel>
                    <InlineSelect
                      value={list}
                      options={lists.map((l) => ({ value: l.name, label: l.name }))}
                      onChange={setList}
                      container={contentEl}
                      renderDot={(v) => lists.find((l) => l.name === v)?.color}
                      renderIcon={(v) => {
                        const icon = lists.find((l) => l.name === v)?.icon;
                        return icon ? <span className="shrink-0">{icon}</span> : null;
                      }}
                    />
                  </div>

                  {/* Due Date & Time. */}
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[color:var(--planner-border-soft)] p-2.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Add Date</FieldLabel>
                      <ToggleSwitch checked={hasDate} onChange={setHasDate} />
                    </div>
                    {hasDate && (
                      <>
                        <FormInput
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                          <FieldLabel>Add Time</FieldLabel>
                          <ToggleSwitch checked={hasTime} onChange={setHasTime} />
                        </div>
                        {hasTime && (
                          <FormInput
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* "Remind me on date" - doc lap voi due date. */}
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[color:var(--planner-border-soft)] p-2.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Remind on a Date</FieldLabel>
                      <ToggleSwitch checked={hasRemindOnDate} onChange={setHasRemindOnDate} />
                    </div>
                    {hasRemindOnDate && (
                      <div className="flex items-center gap-1.5">
                        <FormInput
                          type="date"
                          value={remindOnDate}
                          onChange={(e) => setRemindOnDate(e.target.value)}
                        />
                        <FormInput
                          type="time"
                          value={remindOnTime}
                          onChange={(e) => setRemindOnTime(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remind at Location. */}
                  <div className="flex flex-col gap-2 rounded-[10px] border border-[color:var(--planner-border-soft)] p-2.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Remind at Location</FieldLabel>
                      <ToggleSwitch checked={hasLocation} onChange={setHasLocation} />
                    </div>
                    {hasLocation && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                          <FormInput
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            placeholder="Search for a place or address"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          {(["arriving", "leaving"] as LocationTrigger[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setLocationTrigger(t)}
                              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[7px] border px-2 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out"
                              style={{
                                borderColor:
                                  locationTrigger === t ? "var(--planner-primary)" : "var(--planner-border-soft)",
                                background:
                                  locationTrigger === t ? "var(--planner-primary-soft)" : "white",
                                color:
                                  locationTrigger === t
                                    ? "var(--planner-primary)"
                                    : "var(--planner-text-secondary)",
                              }}
                            >
                              <span
                                className="size-3 rounded-full border-2"
                                style={{
                                  borderColor:
                                    locationTrigger === t ? "var(--planner-primary)" : "#c7c7cc",
                                  background: locationTrigger === t ? "var(--planner-primary)" : "transparent",
                                }}
                              />
                              {t === "arriving" ? "When Arriving" : "When Leaving"}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <FieldLabel>Radius</FieldLabel>
                            <span className="text-[11.5px] font-medium text-[color:var(--planner-text-secondary)]">
                              {locationRadius} m
                            </span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={500}
                            step={10}
                            value={locationRadius}
                            onChange={(e) => setLocationRadius(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer accent-[color:var(--planner-primary)]"
                          />
                        </div>
                        {/* Mini map preview (optional, khong goi API ban do
                            that - xem comment dau file). */}
                        <div
                          className="relative flex h-20 items-center justify-center overflow-hidden rounded-[8px] border border-[color:var(--planner-border-soft)]"
                          style={{
                            backgroundImage:
                              "linear-gradient(var(--mset-border) 1px, transparent 1px), linear-gradient(90deg, var(--mset-border) 1px, transparent 1px)",
                            backgroundSize: "14px 14px",
                            backgroundColor: "var(--mset-surface-secondary)",
                          }}
                        >
                          <MapPin size={18} className="text-[color:var(--mset-danger)]" fill="var(--mset-danger)" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Priority</FieldLabel>
                    <PriorityPicker value={priority} onChange={setPriority} />
                  </div>

                  {/* Flag. */}
                  <div className="flex items-center justify-between">
                    <FieldLabel>Flag</FieldLabel>
                    <button
                      type="button"
                      onClick={() => setFlagged((v) => !v)}
                      aria-pressed={flagged}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] transition-colors duration-150 ease-out"
                      style={{
                        color: flagged ? "var(--mset-warning)" : "var(--planner-text-muted)",
                        background: flagged ? "rgba(255,159,10,.12)" : "transparent",
                      }}
                    >
                      <Flag size={15} fill={flagged ? "var(--mset-warning)" : "none"} />
                    </button>
                  </div>

                  {/* Tags. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Tags</FieldLabel>
                    <div className="relative flex items-center gap-1.5">
                      <Hash size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                      <FormInput
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setTagSuggestOpen(true);
                        }}
                        onFocus={() => setTagSuggestOpen(true)}
                        onBlur={() => setTimeout(() => setTagSuggestOpen(false), 120)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                        placeholder="Add tag, press Enter"
                      />
                      {tagSuggestOpen && filteredTagSuggestions.length > 0 && (
                        <div className="absolute top-full left-5 z-50 mt-1 w-56 overflow-hidden rounded-[9px] border border-[color:var(--planner-border)] bg-white p-1 shadow-[0_10px_28px_rgba(20,30,50,.16)]">
                          {filteredTagSuggestions.slice(0, 6).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addTag(t)}
                              className="flex w-full cursor-pointer items-center rounded-[6px] px-2 py-1.5 text-left text-[12.5px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <TagChip key={t} tag={t} onRemove={() => removeTag(t)} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subtasks. */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Subtasks</FieldLabel>
                      <button
                        type="button"
                        onClick={addSubtask}
                        className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-[color:var(--planner-primary)] hover:underline"
                      >
                        <Plus size={12} /> Add Subtask
                      </button>
                    </div>
                    {subtasks.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {subtasks.map((s) => (
                          <SubtaskRow
                            key={s.id}
                            subtask={s}
                            onChange={(next) => updateSubtask(s.id, next)}
                            onRemove={() => removeSubtask(s.id)}
                            onEnter={() => insertSubtaskAfter(s.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Early Reminder - chi hien khi co due date. */}
                  {hasDate && (
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Early Reminder</FieldLabel>
                      <div className="flex items-center gap-1.5">
                        <Bell size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                        <div className="flex-1">
                          <InlineSelect
                            value={earlyReminder}
                            options={EARLY_REMINDER_OPTIONS}
                            onChange={setEarlyReminder}
                            container={contentEl}
                          />
                        </div>
                      </div>
                      {earlyReminder === "custom" && (
                        <div className="flex items-center gap-1.5 pl-5">
                          <FormInput
                            type="number"
                            min={1}
                            value={earlyReminderCustomMinutes}
                            onChange={(e) =>
                              setEarlyReminderCustomMinutes(Math.max(1, Number(e.target.value) || 1))
                            }
                            className="w-24"
                          />
                          <span className="text-[12px] text-[color:var(--planner-text-muted)]">
                            minutes before
                            {" "}
                            ({minutesFromEarlyReminder("custom", earlyReminderCustomMinutes)} min)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>URL</FieldLabel>
                    <div className="flex items-center gap-1.5">
                      <Link2 size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                      <FormInput
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL"
                        className={cn(!urlValid && "border-[color:var(--mset-danger)]")}
                      />
                    </div>
                    {!urlValid && (
                      <p className="pl-5 text-[11px]" style={{ color: "var(--mset-danger)" }}>
                        Enter a valid URL.
                      </p>
                    )}
                  </div>

                  {/* Images. */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Images</FieldLabel>
                      {images.length === 0 ? (
                        <GhostAddButton
                          icon={ImagePlus}
                          label="Add Image"
                          onClick={() => imageInputRef.current?.click()}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-[color:var(--planner-primary)] hover:underline"
                        >
                          <Plus size={12} /> Add Image
                        </button>
                      )}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleImagesPicked(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {images.map((img) => (
                          <ImageThumb
                            key={img.id}
                            image={img}
                            onRemove={() => removeImage(img.id)}
                            onOpen={() => setLightboxImage(img)}
                          />
                        ))}
                      </div>
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
                </div>
              </motion.div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </AnimatePresence>

      {/* Lightbox - "Click thumbnail: lightbox xem lớn" - spec. Overlay
          RIENG, z-index cao hon modal chinh, dong khi bam ra ngoai/Escape/X. */}
      {lightboxImage && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setLightboxImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setLightboxImage(null);
          }}
          className="fixed inset-0 z-[60] flex cursor-zoom-out items-center justify-center bg-black/80 p-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL client-side */}
          <img
            src={lightboxImage.url}
            alt={lightboxImage.fileName ?? "Image preview"}
            className="max-h-full max-w-full rounded-[8px] object-contain shadow-[0_20px_60px_rgba(0,0,0,.4)]"
          />
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close preview"
            className="absolute top-5 right-5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </Dialog.Root>
  );
}
