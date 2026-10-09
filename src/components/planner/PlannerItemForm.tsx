"use client";

// [2026-10-09] MOT form duy nhat cho MOI luong tao/sua (spec muc C).
//
// Thay 4 form rieng truoc day - AddTaskForm (~390 dong), EditItemForm (~195
// dong), EventForm, ReminderForm - moi cai tu cai dat lai validate gio, tu
// quyet dinh field nao bat buoc, tu goi server action theo kieu rieng. Hau
// qua that: tao tu nut "+" cho ra item khac tao tu keo-tha tren luoi, va sua
// 1 item lam mat nhung field ma form sua khong biet den.
//
// Gio: 1 component, nhan `type` + (tuy chon) `initial`. Khac biet giua Task/
// Event/Reminder KHONG phai 3 nhanh code - no la DU LIEU trong
// PLANNER_TYPE_META (allowedScheduleKinds / completable / supportsChecklist /
// supportsPlace). Them 1 loai moi = them 1 dong vao bang do.
//
// Validate dung CHUNG `validateDraft()` voi backend - khong co ban sao luat
// nao trong form nay.

import { useId, useMemo, useState } from "react";
import { Loader2, MapPin, Link2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLANNER_CATEGORIES,
  PLANNER_CATEGORY_META,
  PLANNER_PRIORITIES,
  PLANNER_PRIORITY_META,
  PLANNER_SCHEDULE_KIND_LABEL,
  PLANNER_STATUS_META,
  PLANNER_TYPE_META,
  resolveCategoryColor,
  SELECTABLE_STATUSES,
  validateDraft,
  type CategoryColorOverrides,
  type ChecklistItem,
  type PlannerCategory,
  type PlannerItem,
  type PlannerItemType,
  type PlannerPriority,
  type PlannerScheduleKind,
  type PlannerStatus,
} from "@/lib/planner/planner-domain";
import type {
  CreatePlannerItemInput,
  UpdatePlannerItemInput,
} from "@/lib/api/planner";
import {
  DeleteConfirmPopover,
  FieldLabel,
  FormInput,
  InlineSelect,
  randomId,
} from "./macos-form-controls";
import { PlannerInlineError } from "./planner-states";
import { PlannerItemCard } from "./PlannerItemCard";

// --- Segmented control (dung cho scheduleKind + o Settings) ----------------

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex w-full rounded-[8px] border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface-soft)] p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-[6px] px-2 py-1.5 text-[12px] font-medium transition-colors",
              active
                ? "bg-white text-[color:var(--planner-text-primary)] shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                : "text-[color:var(--planner-text-secondary)] hover:text-[color:var(--planner-text-primary)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// --- Chuyen doi ISO <-> input date/time ------------------------------------

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function isoToDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isoToTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/** Ngay + gio theo gio DIA PHUONG -> ISO. */
function partsToIso(date: string, time: string): string | null {
  if (!date) return null;
  const [h, m] = (time || "00:00").split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(y, mo - 1, d, h || 0, m || 0, 0, 0).toISOString();
}
/**
 * ALL_DAY: backend chuan hoa ve NUA DEM UTC. Gui nua dem UTC luon de khong
 * bi lech 1 ngay khi may nguoi dung o mui gio duong (vd VN UTC+7: nua dem
 * dia phuong 09-10 -> 08-10T17:00Z -> backend cat ve 08-10, SAI 1 ngay).
 */
function dateToAllDayIso(date: string): string | null {
  if (!date) return null;
  return `${date}T00:00:00.000Z`;
}
function allDayIsoToDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

// --- Field ngay/gio --------------------------------------------------------

function DateTimeField({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  withTime = true,
  error,
}: {
  label: string;
  date: string;
  time: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  withTime?: boolean;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id}>
        <FieldLabel>{label}</FieldLabel>
      </label>
      <div className="flex min-w-0 gap-1.5">
        <FormInput
          id={id}
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          aria-invalid={!!error}
          className={cn("min-w-0 flex-1", error && "border-[color:var(--mset-danger)]")}
        />
        {withTime && (
          <FormInput
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label={`${label} — giờ`}
            aria-invalid={!!error}
            className={cn("w-[108px] shrink-0", error && "border-[color:var(--mset-danger)]")}
          />
        )}
      </div>
      {error && <PlannerInlineError message={error} />}
    </div>
  );
}

// --- Form ------------------------------------------------------------------

export type PlannerItemFormProps = {
  /** Loai item. Khi `initial` co, lay tu `initial.type`. */
  type: PlannerItemType;
  /** Co = che do SUA; khong = che do TAO. */
  initial?: PlannerItem;
  /** Gia tri dat truoc khi tao (vd keo-tha tren luoi da chon san khung gio). */
  prefill?: {
    scheduleKind?: PlannerScheduleKind;
    startAt?: string;
    endAt?: string;
    dueAt?: string;
    category?: PlannerCategory;
  };
  overrides?: CategoryColorOverrides;
  /** Node cua Dialog - de dropdown long trong modal khong bi FocusScope chan. */
  container?: HTMLElement | null;
  onSubmit: (
    payload: CreatePlannerItemInput | UpdatePlannerItemInput,
  ) => Promise<void> | void;
  onCancel: () => void;
  onDelete?: () => Promise<void> | void;
};

export function PlannerItemForm({
  type: typeProp,
  initial,
  prefill,
  overrides,
  container,
  onSubmit,
  onCancel,
  onDelete,
}: PlannerItemFormProps) {
  const editing = !!initial;
  const [type, setType] = useState<PlannerItemType>(initial?.type ?? typeProp);
  const meta = PLANNER_TYPE_META[type];

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<PlannerCategory>(
    initial?.category ?? prefill?.category ?? "OTHER",
  );
  const [status, setStatus] = useState<PlannerStatus>(() => {
    // OVERDUE la trang thai SUY RA, khong chon tay duoc - mo form sua 1 item
    // dang qua han thi quy ve SCHEDULED de dropdown co gia tri hop le.
    const s = initial?.status ?? "SCHEDULED";
    return s === "OVERDUE" ? "SCHEDULED" : s;
  });
  const [priority, setPriority] = useState<PlannerPriority>(
    initial?.priority ?? "NONE",
  );

  const [scheduleKind, setScheduleKind] = useState<PlannerScheduleKind>(
    initial?.scheduleKind ?? prefill?.scheduleKind ?? meta.defaultScheduleKind,
  );

  const allDay = scheduleKind === "ALL_DAY";
  const [startDate, setStartDate] = useState(() =>
    allDay
      ? allDayIsoToDateInput(initial?.startAt ?? prefill?.startAt ?? null)
      : isoToDateInput(initial?.startAt ?? prefill?.startAt ?? null),
  );
  const [startTime, setStartTime] = useState(() =>
    isoToTimeInput(initial?.startAt ?? prefill?.startAt ?? null),
  );
  const [endDate, setEndDate] = useState(() =>
    allDay
      ? allDayIsoToDateInput(initial?.endAt ?? prefill?.endAt ?? null)
      : isoToDateInput(initial?.endAt ?? prefill?.endAt ?? null),
  );
  const [endTime, setEndTime] = useState(() =>
    isoToTimeInput(initial?.endAt ?? prefill?.endAt ?? null),
  );
  const [dueDate, setDueDate] = useState(() =>
    isoToDateInput(initial?.dueAt ?? prefill?.dueAt ?? null),
  );
  const [dueTime, setDueTime] = useState(() =>
    isoToTimeInput(initial?.dueAt ?? prefill?.dueAt ?? null),
  );

  const [location, setLocation] = useState(initial?.location ?? "");
  const [meetingUrl, setMeetingUrl] = useState(initial?.meetingUrl ?? "");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initial?.checklist ?? [],
  );
  const [newSubtask, setNewSubtask] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Moc thoi gian da chuan hoa - dung cho CA validate, preview va payload, nen
  // 3 cho khong the lech nhau.
  const times = useMemo(() => {
    if (scheduleKind === "ALL_DAY") {
      return {
        startAt: dateToAllDayIso(startDate),
        endAt: dateToAllDayIso(endDate || startDate),
        dueAt: null,
      };
    }
    if (scheduleKind === "TIMED") {
      return {
        startAt: partsToIso(startDate, startTime),
        // Khong nhap ngay ket thuc = CUNG ngay bat dau (truong hop thuong
        // gap nhat); vat qua nua dem thi nguoi dung doi ngay ket thuc.
        endAt: partsToIso(endDate || startDate, endTime),
        dueAt: null,
      };
    }
    if (scheduleKind === "DEADLINE") {
      return { startAt: null, endAt: null, dueAt: partsToIso(dueDate, dueTime) };
    }
    return { startAt: null, endAt: null, dueAt: null };
  }, [scheduleKind, startDate, startTime, endDate, endTime, dueDate, dueTime]);

  const errors = useMemo(
    () =>
      validateDraft({
        type,
        title,
        scheduleKind,
        startAt: times.startAt,
        endAt: times.endAt,
        dueAt: times.dueAt,
        meetingUrl: meetingUrl || null,
      }),
    [type, title, scheduleKind, times, meetingUrl],
  );
  const hasErrors = Object.keys(errors).length > 0;
  /** Chi hien loi SAU khi nguoi dung bam Luu - khong mang do khi vua mo form. */
  const show = (k: string) => (touched ? errors[k] : undefined);

  // Doi loai item -> scheduleKind hien tai co the khong con hop le.
  function handleTypeChange(next: PlannerItemType) {
    setType(next);
    const nextMeta = PLANNER_TYPE_META[next];
    if (!nextMeta.allowedScheduleKinds.includes(scheduleKind)) {
      setScheduleKind(nextMeta.defaultScheduleKind);
    }
    if (!nextMeta.completable && (status === "COMPLETED" || status === "IN_PROGRESS")) {
      setStatus("SCHEDULED");
    }
  }

  // Doi kieu lich: chuyen tiep gia tri da nhap sang o tuong ung thay vi bo
  // trong (nguoi dung vua nhap gio roi doi sang "Han chot" khong phai nhap lai).
  function handleScheduleKindChange(next: PlannerScheduleKind) {
    if (next === "DEADLINE" && !dueDate) {
      setDueDate(startDate || isoToDateInput(new Date().toISOString()));
      setDueTime(startTime || "09:00");
    }
    if ((next === "TIMED" || next === "ALL_DAY") && !startDate) {
      setStartDate(dueDate || isoToDateInput(new Date().toISOString()));
      if (next === "TIMED") {
        setStartTime(dueTime || "09:00");
        if (!endTime) setEndTime("10:00");
      }
    }
    setScheduleKind(next);
  }

  // Preview the - nguoi dung thay NGAY the se trong the nao tren lich (yeu
  // cau truoc day: "hiển thị thêm card công việc demo khi chọn màu").
  const previewItem: PlannerItem = useMemo(
    () => ({
      id: initial?.id ?? "preview",
      type,
      title: title.trim() || "Tiêu đề việc",
      description: description || null,
      category,
      status,
      priority,
      scheduleKind,
      startAt: times.startAt,
      endAt: times.endAt,
      dueAt: times.dueAt,
      location: location || null,
      meetingUrl: meetingUrl || null,
      checklist,
      recurrence: initial?.recurrence ?? null,
      orderIndex: initial?.orderIndex ?? 0,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [
      initial, type, title, description, category, status, priority,
      scheduleKind, times, location, meetingUrl, checklist,
    ],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setServerError(null);
    setSubmitting(true);
    try {
      // Che do SUA gui null de XOA field (backend phan biet null vs vang
      // mat); che do TAO bo han field trong di.
      const base = {
        type,
        title: title.trim(),
        category,
        status,
        priority,
        scheduleKind,
      };
      if (editing) {
        await onSubmit({
          ...base,
          description: description.trim() || null,
          startAt: times.startAt,
          endAt: times.endAt,
          dueAt: times.dueAt,
          location: meta.supportsPlace ? location.trim() || null : null,
          meetingUrl: meta.supportsPlace ? meetingUrl.trim() || null : null,
          checklist: meta.supportsChecklist ? checklist : null,
        } satisfies UpdatePlannerItemInput);
      } else {
        await onSubmit({
          ...base,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(times.startAt ? { startAt: times.startAt } : {}),
          ...(times.endAt ? { endAt: times.endAt } : {}),
          ...(times.dueAt ? { dueAt: times.dueAt } : {}),
          ...(meta.supportsPlace && location.trim() ? { location: location.trim() } : {}),
          ...(meta.supportsPlace && meetingUrl.trim() ? { meetingUrl: meetingUrl.trim() } : {}),
          ...(meta.supportsChecklist && checklist.length ? { checklist } : {}),
        } satisfies CreatePlannerItemInput);
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Lưu không thành công. Thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const categoryColor = resolveCategoryColor(category, overrides);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* --- Loai (chi doi duoc khi TAO - doi loai cua item da luu se lam
          mat field khong hop le, de nguoi dung xoa va tao lai cho ro rang) */}
      {!editing && (
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Loại</FieldLabel>
          <Segmented
            value={type}
            onChange={handleTypeChange}
            options={(["TASK", "EVENT", "REMINDER"] as PlannerItemType[]).map((t) => ({
              value: t,
              label: PLANNER_TYPE_META[t].label,
            }))}
          />
          <p className="text-[11px] leading-[1.4] text-[color:var(--planner-text-muted)]">
            {meta.description}
          </p>
        </div>
      )}

      {/* --- Tieu de */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Tiêu đề</FieldLabel>
        <FormInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bạn cần làm gì?"
          autoFocus
          aria-invalid={!!show("title")}
          className={show("title") ? "border-[color:var(--mset-danger)]" : undefined}
        />
        {show("title") && <PlannerInlineError message={show("title")!} />}
      </div>

      {/* --- Kieu lich. REMINDER chi co 1 kieu hop le -> khong ve segmented
          cho 1 lua chon duy nhat, chi hien nhan. */}
      {meta.allowedScheduleKinds.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Thời gian</FieldLabel>
          <Segmented
            value={scheduleKind}
            onChange={handleScheduleKindChange}
            options={meta.allowedScheduleKinds.map((k) => ({
              value: k,
              label: PLANNER_SCHEDULE_KIND_LABEL[k],
            }))}
          />
        </div>
      ) : null}

      {/* --- O ngay/gio theo kieu lich */}
      {scheduleKind === "UNSCHEDULED" && (
        <p className="rounded-[8px] bg-[color:var(--planner-surface-soft)] px-3 py-2 text-[11.5px] leading-[1.5] text-[color:var(--planner-text-secondary)]">
          Việc này nằm trong danh sách “Chưa xếp lịch”, không hiện trên lịch
          tuần. Đổi sang “Khung giờ” hoặc “Hạn chót” bất cứ lúc nào.
        </p>
      )}

      {scheduleKind === "DEADLINE" && (
        <DateTimeField
          label="Hạn chót"
          date={dueDate}
          time={dueTime}
          onDateChange={setDueDate}
          onTimeChange={setDueTime}
          error={show("dueAt")}
        />
      )}

      {scheduleKind === "TIMED" && (
        <div className="flex flex-col gap-3">
          <DateTimeField
            label="Bắt đầu"
            date={startDate}
            time={startTime}
            onDateChange={(v) => {
              setStartDate(v);
              // Ngay ket thuc trong hoac truoc ngay bat dau -> keo theo.
              if (!endDate || endDate < v) setEndDate(v);
            }}
            onTimeChange={setStartTime}
            error={show("startAt")}
          />
          <DateTimeField
            label="Kết thúc"
            date={endDate || startDate}
            time={endTime}
            onDateChange={setEndDate}
            onTimeChange={setEndTime}
            error={show("endAt")}
          />
        </div>
      )}

      {scheduleKind === "ALL_DAY" && (
        <div className="flex flex-col gap-3">
          <DateTimeField
            label="Từ ngày"
            date={startDate}
            time=""
            withTime={false}
            onDateChange={(v) => {
              setStartDate(v);
              if (!endDate || endDate < v) setEndDate(v);
            }}
            onTimeChange={() => {}}
            error={show("startAt")}
          />
          <DateTimeField
            label="Đến ngày (bao gồm)"
            date={endDate || startDate}
            time=""
            withTime={false}
            onDateChange={setEndDate}
            onTimeChange={() => {}}
            error={show("endAt")}
          />
        </div>
      )}

      {/* --- Phan loai + trang thai + uu tien */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>Phân loại</FieldLabel>
          <InlineSelect<PlannerCategory>
            value={category}
            onChange={setCategory}
            container={container}
            renderDot={(c) => resolveCategoryColor(c, overrides).main}
            options={PLANNER_CATEGORIES.map((c) => ({
              value: c,
              label: PLANNER_CATEGORY_META[c].label,
            }))}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>Ưu tiên</FieldLabel>
          <InlineSelect<PlannerPriority>
            value={priority}
            onChange={setPriority}
            container={container}
            renderDot={(p) =>
              p === "NONE" ? undefined : PLANNER_PRIORITY_META[p].color
            }
            options={PLANNER_PRIORITIES.map((p) => ({
              value: p,
              label: PLANNER_PRIORITY_META[p].label,
            }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Trạng thái</FieldLabel>
        <InlineSelect<PlannerStatus>
          value={status}
          onChange={setStatus}
          container={container}
          renderDot={(s) => PLANNER_STATUS_META[s].color}
          options={SELECTABLE_STATUSES
            // EVENT khong co khai niem "dang lam"/"hoan thanh" - chi dien ra
            // hoac bi huy.
            .filter((s) =>
              meta.completable ? true : s !== "COMPLETED" && s !== "IN_PROGRESS",
            )
            .map((s) => ({ value: s, label: PLANNER_STATUS_META[s].label }))}
        />
      </div>

      {/* --- Dia diem / link hop: CHI loai ho tro (EVENT) */}
      {meta.supportsPlace && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Địa điểm</FieldLabel>
            <div className="relative">
              <MapPin
                size={13}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--planner-text-muted)]"
                aria-hidden="true"
              />
              <FormInput
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Phòng họp, địa chỉ…"
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Link họp</FieldLabel>
            <div className="relative">
              <Link2
                size={13}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--planner-text-muted)]"
                aria-hidden="true"
              />
              <FormInput
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="meet.google.com/…"
                aria-invalid={!!show("meetingUrl")}
                className={cn("pl-8", show("meetingUrl") && "border-[color:var(--mset-danger)]")}
              />
            </div>
            {show("meetingUrl") && <PlannerInlineError message={show("meetingUrl")!} />}
          </div>
        </div>
      )}

      {/* --- Checklist: CHI loai ho tro (TASK) */}
      {meta.supportsChecklist && (
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Việc con</FieldLabel>
          {checklist.length > 0 && (
            <ul className="flex flex-col gap-1">
              {checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={(e) =>
                      setChecklist((prev) =>
                        prev.map((x) =>
                          x.id === c.id ? { ...x, done: e.target.checked } : x,
                        ),
                      )
                    }
                    className="size-3.5 shrink-0 cursor-pointer accent-[color:var(--planner-primary)]"
                    aria-label={c.title}
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-[12.5px] break-words",
                      c.done
                        ? "text-[color:var(--planner-text-muted)] line-through"
                        : "text-[color:var(--planner-text-primary)]",
                    )}
                  >
                    {c.title}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist((prev) => prev.filter((x) => x.id !== c.id))
                    }
                    aria-label={`Xoá "${c.title}"`}
                    className="shrink-0 cursor-pointer rounded p-0.5 text-[color:var(--planner-text-muted)] hover:text-[color:var(--mset-danger)]"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-1.5">
            <FormInput
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                // Enter o o nay THEM VIEC CON, khong submit ca form.
                if (e.key === "Enter") {
                  e.preventDefault();
                  const t = newSubtask.trim();
                  if (!t) return;
                  setChecklist((prev) => [...prev, { id: randomId(), title: t, done: false }]);
                  setNewSubtask("");
                }
              }}
              placeholder="Thêm việc con…"
              className="min-w-0 flex-1 py-1.5"
            />
            <button
              type="button"
              onClick={() => {
                const t = newSubtask.trim();
                if (!t) return;
                setChecklist((prev) => [...prev, { id: randomId(), title: t, done: false }]);
                setNewSubtask("");
              }}
              aria-label="Thêm việc con"
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[color:var(--planner-text-secondary)] hover:bg-[color:var(--planner-surface-soft)]"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* --- Mo ta */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Mô tả</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ghi chú thêm…"
          className="w-full resize-y rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-3.5 py-2.5 text-[13px] leading-[1.5] text-[color:var(--planner-text-primary)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--planner-text-muted)] focus:border-[color:var(--planner-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,255,.12)]"
        />
      </div>

      {/* --- Xem truoc the: mau category + trang thai + uu tien doi NGAY */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Xem trước</FieldLabel>
        <div
          className="rounded-[8px] border border-[color:var(--planner-border-soft)] p-2.5"
          style={{ backgroundColor: "var(--planner-surface-soft)" }}
        >
          <div className="h-[68px]">
            <PlannerItemCard
              item={previewItem}
              variant={scheduleKind === "UNSCHEDULED" ? "list" : "timed"}
              overrides={overrides}
              height={68}
              className={scheduleKind === "UNSCHEDULED" ? undefined : "h-full"}
            />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-[color:var(--planner-text-muted)]">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: categoryColor.main }}
              aria-hidden="true"
            />
            {PLANNER_CATEGORY_META[category].label} · {categoryColor.main}
          </p>
        </div>
      </div>

      {serverError && <PlannerInlineError message={serverError} />}

      {/* --- Hanh dong */}
      <div className="flex items-center gap-2 border-t border-[color:var(--planner-border-soft)] pt-3">
        {editing && onDelete && (
          <DeleteConfirmPopover
            label="Xoá"
            confirmText="Xoá việc này?"
            onConfirm={() => void onDelete()}
          />
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[color:var(--planner-surface-soft)]"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] bg-[color:var(--planner-primary)] px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[color:var(--mset-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
          {editing ? "Lưu" : "Tạo"}
        </button>
      </div>
    </form>
  );
}
