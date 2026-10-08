"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FieldLabel, FormInput, InlineSelect } from "./macos-form-controls";
import {
  REPEAT_FREQUENCY_OPTIONS,
  ORDINAL_WEEK_OPTIONS,
  type RecurrenceRule,
  type RepeatFrequency,
  type DayOfWeek,
  type OrdinalWeek,
  type MonthlyMode,
  type EndRepeatCondition,
  type RecurrenceIntervalUnit,
} from "./calendar-types";

// [2026-10-08] RecurrenceEditor - "Code component RecurrenceEditor theo
// macOS Calendar style". DOC LAP voi model PlannerItem (xem comment dau
// calendar-types.ts) - component nay la 1 SECTION INLINE (KHONG tu boc
// Popover/Dialog, dung spec "UI (inline section hoặc popover)" - de NOI GOI
// (vd nhung vao EventForm/ReminderForm, hoac dat thang trong 1 Popover
// rieng) tu quyet dinh boc the nao). FULLY CONTROLLED - khong co state noi
// bo luu `value`, moi thay doi goi `onChange` NGAY, cha nam giu state that.

const WEEKDAY_ABBR: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};
const WEEKDAY_FULL: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
const WEEKDAY_INITIAL: Record<DayOfWeek, string> = {
  0: "S",
  1: "M",
  2: "T",
  3: "W",
  4: "T",
  5: "F",
  6: "S",
};
// Thu tu hien thi NUT TRON (M T W T F S S, "Thứ 2 đầu tuần") - KHAC voi key
// cua record (0=CN..6=T7, khop Date.getDay()).
const WEEKDAY_BUTTON_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
function weekdayMonFirstRank(d: DayOfWeek): number {
  return d === 0 ? 7 : d;
}
function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// [2026-10-08] "Default: ngày của startDate" (weekly/monthly), "tháng của
// startDate" (yearly) - spec. `prev` (rule TRUOC khi doi frequency, neu co)
// duoc uu tien giu lai cac lua chon lien quan (vd doi Weekly -> Biweekly VAN
// giu nguyen cac thu da chon) - CHI fallback ve gia tri suy tu startDate khi
// `prev` chua co du lieu cho truong do (lan dau chon frequency do, hoac tu
// "Never" chuyen sang).
function defaultRuleFromFrequency(
  freq: RepeatFrequency,
  startDate: string,
  prev?: RecurrenceRule,
): RecurrenceRule {
  const d = new Date(`${startDate}T00:00:00`);
  const startWeekday = d.getDay() as DayOfWeek;
  const startDayOfMonth = d.getDate();
  const startMonth = d.getMonth() + 1;
  const end: EndRepeatCondition = prev?.end ?? { type: "never" };
  const weekdays = prev?.weekdays?.length ? prev.weekdays : [startWeekday];
  const monthly: MonthlyMode = prev?.monthly ?? { mode: "day_of_month", day: startDayOfMonth };
  const months = prev?.months?.length ? prev.months : [startMonth];

  const base = { weekdays, monthly, months, end };
  switch (freq) {
    case "daily":
      return { frequency: "daily", interval: 1, intervalUnit: "days", ...base };
    case "weekly":
      return { frequency: "weekly", interval: 1, intervalUnit: "weeks", ...base };
    case "biweekly":
      return { frequency: "biweekly", interval: 2, intervalUnit: "weeks", ...base };
    case "monthly":
      return { frequency: "monthly", interval: 1, intervalUnit: "months", ...base };
    case "yearly":
      return { frequency: "yearly", interval: 1, intervalUnit: "years", ...base };
    case "custom":
      return {
        frequency: "custom",
        interval: prev?.interval ?? 1,
        intervalUnit: prev?.intervalUnit ?? "weeks",
        ...base,
      };
  }
}

// [2026-10-08] "Preview text... mô tả tự nhiên rule đã chọn" - spec, kem 3
// vi du mau ("Every 2 weeks on Mon, Wed, Fri", "Monthly on the first
// Monday, ends after 12 times", "Every year in March and September").
function describeRule(rule: RecurrenceRule): string {
  const { frequency, interval, intervalUnit, weekdays, monthly, months } = rule;
  let base = "";
  const isWeeklyLike = frequency === "weekly" || frequency === "biweekly" ||
    (frequency === "custom" && intervalUnit === "weeks");
  const isMonthlyLike = frequency === "monthly" ||
    (frequency === "custom" && intervalUnit === "months");
  const isYearlyLike = frequency === "yearly" ||
    (frequency === "custom" && intervalUnit === "years");

  if (frequency === "daily" || (frequency === "custom" && intervalUnit === "days")) {
    const n = frequency === "daily" ? 1 : interval;
    base = n === 1 ? "Every day" : `Every ${n} days`;
  } else if (isWeeklyLike) {
    const n = frequency === "weekly" ? 1 : frequency === "biweekly" ? 2 : interval;
    const unitLabel = n === 1 ? "week" : "weeks";
    const days = [...weekdays]
      .sort((a, b) => weekdayMonFirstRank(a) - weekdayMonFirstRank(b))
      .map((d) => WEEKDAY_ABBR[d])
      .join(", ");
    base = `Every ${n} ${unitLabel}${days ? ` on ${days}` : ""}`;
  } else if (isMonthlyLike) {
    const n = frequency === "monthly" ? 1 : interval;
    const prefix = n === 1 ? "Monthly" : `Every ${n} months`;
    if (monthly.mode === "day_of_month") {
      const dayLabel = monthly.day === -1 ? "the last day" : `day ${monthly.day}`;
      base = `${prefix} on ${dayLabel}`;
    } else {
      base = `${prefix} on the ${monthly.ordinal} ${WEEKDAY_FULL[monthly.weekday]}`;
    }
  } else if (isYearlyLike) {
    const n = frequency === "yearly" ? 1 : interval;
    const prefix = n === 1 ? "Every year" : `Every ${n} years`;
    const monthNames = [...months].sort((a, b) => a - b).map((m) => MONTH_FULL[m - 1]);
    base = monthNames.length ? `${prefix} in ${joinWithAnd(monthNames)}` : prefix;
  }

  if (rule.end.type === "after_count") {
    base += `, ends after ${rule.end.count} time${rule.end.count === 1 ? "" : "s"}`;
  } else if (rule.end.type === "on_date") {
    base += `, ends on ${formatDateShort(rule.end.date)}`;
  }
  return base;
}

function dayAfter(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Nut tron da chon/chua chon - dung CHUNG cho weekday picker.
function RoundToggle({
  active,
  label,
  title,
  onClick,
}: {
  active: boolean;
  label: string;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex size-7 cursor-pointer items-center justify-center rounded-full border text-[11.5px] font-semibold transition-colors duration-150 ease-out"
      style={{
        borderColor: active ? "var(--planner-primary)" : "var(--planner-border-soft)",
        background: active ? "var(--planner-primary)" : "white",
        color: active ? "#fff" : "var(--planner-text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

// Radio dot (khong dung <input type=radio> native, quy uoc chung toan app).
function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      className="flex size-4 shrink-0 items-center justify-center rounded-full border-2"
      style={{ borderColor: active ? "var(--planner-primary)" : "#c7c7cc" }}
    >
      {active && <span className="size-2 rounded-full" style={{ background: "var(--planner-primary)" }} />}
    </span>
  );
}

export function RecurrenceEditor({
  value,
  onChange,
  startDate,
  container,
}: {
  value?: RecurrenceRule;
  onChange: (rule?: RecurrenceRule) => void;
  startDate: string;
  // Forward xuong InlineSelect LONG BEN TRONG (xem comment
  // DropdownMenuContent, ui/dropdown-menu.tsx) - truyen khi RecurrenceEditor
  // nay nam trong 1 Radix Dialog khac (vd EventForm).
  container?: HTMLElement | null;
}) {
  function updateRule(patch: Partial<RecurrenceRule>) {
    if (!value) return;
    onChange({ ...value, ...patch });
  }

  const currentFrequency: "never" | RepeatFrequency = value ? value.frequency : "never";

  function handleFrequencyChange(next: "never" | RepeatFrequency) {
    if (next === "never") {
      onChange(undefined);
      return;
    }
    onChange(defaultRuleFromFrequency(next, startDate, value));
  }

  // [2026-10-08] Validation "weekly: ít nhất 1 ngày được chọn" - chan NGAY
  // tai thao tac toggle (khong cho bo chon THU CUOI CUNG con lai) thay vi
  // cho ra 1 state khong hop le roi moi bao loi rieng.
  function toggleWeekday(d: DayOfWeek) {
    if (!value) return;
    const has = value.weekdays.includes(d);
    if (has && value.weekdays.length === 1) return;
    const next = has ? value.weekdays.filter((x) => x !== d) : [...value.weekdays, d];
    updateRule({ weekdays: next });
  }
  function toggleMonth(m: number) {
    if (!value) return;
    const has = value.months.includes(m);
    if (has && value.months.length === 1) return;
    const next = has ? value.months.filter((x) => x !== m) : [...value.months, m];
    updateRule({ months: next });
  }

  const isWeeklySection =
    !!value &&
    (value.frequency === "weekly" ||
      value.frequency === "biweekly" ||
      (value.frequency === "custom" && value.intervalUnit === "weeks"));
  const isMonthlySection = value?.frequency === "monthly";
  const isYearlySection = value?.frequency === "yearly";

  return (
    <div className="flex flex-col gap-3">
      {/* Frequency selector. */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Repeat</FieldLabel>
        <InlineSelect
          value={currentFrequency}
          options={[{ value: "never" as const, label: "Never" }, ...REPEAT_FREQUENCY_OPTIONS]}
          onChange={handleFrequencyChange}
          container={container}
        />
      </div>

      {value && (
        <>
          {/* Interval - chi khi Custom. */}
          {value.frequency === "custom" && (
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-[color:var(--planner-text-secondary)]">Every</span>
              <FormInput
                type="number"
                min={1}
                max={999}
                value={value.interval}
                onChange={(e) => updateRule({ interval: clamp(Number(e.target.value) || 1, 1, 999) })}
                className="w-16 text-center"
              />
              <div className="w-32">
                <InlineSelect<RecurrenceIntervalUnit>
                  value={value.intervalUnit}
                  options={[
                    { value: "days", label: value.interval === 1 ? "day" : "days" },
                    { value: "weeks", label: value.interval === 1 ? "week" : "weeks" },
                    { value: "months", label: value.interval === 1 ? "month" : "months" },
                    { value: "years", label: value.interval === 1 ? "year" : "years" },
                  ]}
                  onChange={(u) => updateRule({ intervalUnit: u })}
                  container={container}
                />
              </div>
            </div>
          )}

          {/* Weekly options. */}
          {isWeeklySection && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>On these days</FieldLabel>
              <div className="flex gap-1">
                {WEEKDAY_BUTTON_ORDER.map((d) => (
                  <RoundToggle
                    key={d}
                    active={value.weekdays.includes(d)}
                    label={WEEKDAY_INITIAL[d]}
                    title={WEEKDAY_FULL[d]}
                    onClick={() => toggleWeekday(d)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Monthly options. */}
          {isMonthlySection && (
            <div className="flex flex-col gap-2">
              <FieldLabel>On</FieldLabel>
              <label className="flex items-center gap-2">
                <span
                  role="radio"
                  aria-checked={value.monthly.mode === "day_of_month"}
                  onClick={() =>
                    updateRule({
                      monthly: {
                        mode: "day_of_month",
                        day: value.monthly.mode === "day_of_month" ? value.monthly.day : new Date(`${startDate}T00:00:00`).getDate(),
                      },
                    })
                  }
                  className="cursor-pointer"
                >
                  <RadioDot active={value.monthly.mode === "day_of_month"} />
                </span>
                <span className="text-[13px] text-[color:var(--planner-text-primary)]">Day</span>
                <div className="w-24">
                  <InlineSelect<string>
                    value={
                      value.monthly.mode === "day_of_month" ? String(value.monthly.day) : "1"
                    }
                    options={[
                      ...Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                      { value: "-1", label: "Last day" },
                    ]}
                    onChange={(v) => updateRule({ monthly: { mode: "day_of_month", day: Number(v) } })}
                    container={container}
                  />
                </div>
              </label>
              <label className="flex items-center gap-2">
                <span
                  role="radio"
                  aria-checked={value.monthly.mode === "ordinal_weekday"}
                  onClick={() =>
                    updateRule({
                      monthly:
                        value.monthly.mode === "ordinal_weekday"
                          ? value.monthly
                          : { mode: "ordinal_weekday", ordinal: "first", weekday: new Date(`${startDate}T00:00:00`).getDay() as DayOfWeek },
                    })
                  }
                  className="cursor-pointer"
                >
                  <RadioDot active={value.monthly.mode === "ordinal_weekday"} />
                </span>
                <span className="text-[13px] text-[color:var(--planner-text-primary)]">On the</span>
                <div className="w-24">
                  <InlineSelect<OrdinalWeek>
                    value={value.monthly.mode === "ordinal_weekday" ? value.monthly.ordinal : "first"}
                    options={ORDINAL_WEEK_OPTIONS}
                    onChange={(ord) =>
                      updateRule({
                        monthly: {
                          mode: "ordinal_weekday",
                          ordinal: ord,
                          weekday:
                            value.monthly.mode === "ordinal_weekday"
                              ? value.monthly.weekday
                              : (new Date(`${startDate}T00:00:00`).getDay() as DayOfWeek),
                        },
                      })
                    }
                    container={container}
                  />
                </div>
                <div className="w-28">
                  <InlineSelect<string>
                    value={String(value.monthly.mode === "ordinal_weekday" ? value.monthly.weekday : 1)}
                    options={WEEKDAY_BUTTON_ORDER.map((d) => ({ value: String(d), label: WEEKDAY_FULL[d] }))}
                    onChange={(v) =>
                      updateRule({
                        monthly: {
                          mode: "ordinal_weekday",
                          ordinal: value.monthly.mode === "ordinal_weekday" ? value.monthly.ordinal : "first",
                          weekday: Number(v) as DayOfWeek,
                        },
                      })
                    }
                    container={container}
                  />
                </div>
              </label>
            </div>
          )}

          {/* Yearly options. */}
          {isYearlySection && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>In these months</FieldLabel>
              <div className="grid grid-cols-4 gap-1">
                {MONTH_ABBR.map((label, i) => {
                  const m = i + 1;
                  const active = value.months.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      className="flex h-7 cursor-pointer items-center justify-center rounded-[6px] border text-[11.5px] font-semibold transition-colors duration-150 ease-out"
                      style={{
                        borderColor: active ? "var(--planner-primary)" : "var(--planner-border-soft)",
                        background: active ? "var(--planner-primary)" : "white",
                        color: active ? "#fff" : "var(--planner-text-secondary)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* End repeat. */}
          <div className="flex flex-col gap-3 rounded-[10px] border border-[color:var(--planner-border-soft)] p-3.5">
            <FieldLabel>End Repeat</FieldLabel>
            <label className="flex items-center gap-2">
              <span
                role="radio"
                aria-checked={value.end.type === "never"}
                onClick={() => updateRule({ end: { type: "never" } })}
                className="cursor-pointer"
              >
                <RadioDot active={value.end.type === "never"} />
              </span>
              <span className="text-[13px] text-[color:var(--planner-text-primary)]">Never</span>
            </label>
            <label className="flex items-center gap-2">
              <span
                role="radio"
                aria-checked={value.end.type === "after_count"}
                onClick={() =>
                  updateRule({
                    end: { type: "after_count", count: value.end.type === "after_count" ? value.end.count : 1 },
                  })
                }
                className="cursor-pointer"
              >
                <RadioDot active={value.end.type === "after_count"} />
              </span>
              <span className="text-[13px] text-[color:var(--planner-text-primary)]">After</span>
              <FormInput
                type="number"
                min={1}
                disabled={value.end.type !== "after_count"}
                value={value.end.type === "after_count" ? value.end.count : 1}
                onChange={(e) =>
                  updateRule({ end: { type: "after_count", count: clamp(Number(e.target.value) || 1, 1, 9999) } })
                }
                className="w-20 disabled:opacity-40"
              />
              <span className="text-[13px] text-[color:var(--planner-text-secondary)]">occurrences</span>
            </label>
            <label className="flex items-center gap-2">
              <span
                role="radio"
                aria-checked={value.end.type === "on_date"}
                onClick={() =>
                  updateRule({
                    end: {
                      type: "on_date",
                      date: value.end.type === "on_date" ? value.end.date : dayAfter(startDate),
                    },
                  })
                }
                className="cursor-pointer"
              >
                <RadioDot active={value.end.type === "on_date"} />
              </span>
              <span className="text-[13px] text-[color:var(--planner-text-primary)]">On date</span>
              <FormInput
                type="date"
                min={dayAfter(startDate)}
                disabled={value.end.type !== "on_date"}
                value={value.end.type === "on_date" ? value.end.date : dayAfter(startDate)}
                onChange={(e) => {
                  const next = e.target.value < dayAfter(startDate) ? dayAfter(startDate) : e.target.value;
                  updateRule({ end: { type: "on_date", date: next } });
                }}
                className="w-40 disabled:opacity-40"
              />
            </label>
          </div>

          {/* Preview text. */}
          <p
            className="rounded-[8px] px-2.5 py-2 text-[12.5px] font-medium"
            style={{ background: "var(--mset-surface-secondary)", color: "var(--planner-text-secondary)" }}
          >
            {describeRule(value)}
          </p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// [2026-10-08] "Edit existing recurrence — scope dialog" - spec rieng, KHAC
// voi RecurrenceEditor o tren (nay la 1 action-sheet 3 nut, hien khi nguoi
// dung SUA 1 event/reminder DA co recurrence + DA co instances, khong phai
// 1 phan cua form chinh rule). Co prop `open` RIENG (khac EventForm/
// ReminderForm) vi day la 1 dialog TRIGGER TU XA (vd luc bam Save tren 1
// item lap lai), hop ly de cha giu mount lien tuc + bat/tat qua `open`.
// ---------------------------------------------------------------------------

export function RecurrenceScopeDialog({
  open,
  onCancel,
  onThisEventOnly,
  onThisAndFuture,
  onAllEvents,
  // "event/reminder" - spec dung chung cho ca 2 ngu canh (EventForm va
  // ReminderForm deu co the goi dialog nay) - mac dinh "event", truyen
  // "reminder" khi goi tu ReminderForm.
  itemLabel = "event",
}: {
  open: boolean;
  onCancel: () => void;
  onThisEventOnly: () => void;
  onThisAndFuture: () => void;
  onAllEvents: () => void;
  itemLabel?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70]"
                style={{ backgroundColor: "rgba(0,0,0,.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onOpenAutoFocus={(e) => e.preventDefault()}>
              <div className="fixed top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-[320px] overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,.97)",
                    border: "1px solid rgba(255,255,255,.8)",
                    borderRadius: 14,
                    boxShadow: "0 24px 60px rgba(0,0,0,.18)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    fontFamily: "var(--planner-font-family)",
                  }}
                >
                  <Dialog.Title asChild>
                    <p
                      className="px-4 pt-4 pb-3 text-center text-[13px] font-medium"
                      style={{ color: "var(--mset-text-secondary)" }}
                    >
                      This is a repeating {itemLabel}. Which {itemLabel}s would you like to change?
                    </p>
                  </Dialog.Title>
                  <div className="flex flex-col border-t" style={{ borderColor: "var(--mset-divider)" }}>
                    {[
                      { label: "This Event Only", onClick: onThisEventOnly },
                      { label: "This and Future Events", onClick: onThisAndFuture },
                      { label: "All Events", onClick: onAllEvents },
                    ].map((opt, i) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={opt.onClick}
                        className={cn(
                          "cursor-pointer px-4 py-3 text-[14px] font-medium text-[color:var(--planner-primary)] hover:bg-[var(--planner-surface-soft)]",
                          i < 2 && "border-b",
                        )}
                        style={{ borderColor: "var(--mset-divider)" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full cursor-pointer border-t px-4 py-3 text-[14px] font-semibold text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                    style={{ borderColor: "var(--mset-divider)" }}
                  >
                    Cancel
                  </button>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
