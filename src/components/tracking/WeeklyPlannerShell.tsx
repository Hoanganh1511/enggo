"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Trash2 } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type { ApiTrackingBestHour, ApiTrackingTimeBlock, TrackingTimeBlockKind } from "@/lib/api/tracking";
import {
  listTrackingTimeBlocksAction,
  createTrackingTimeBlockAction,
  updateTrackingTimeBlockAction,
  deleteTrackingTimeBlockAction,
} from "@/actions/tracking/weekly";
import { getTrackingBestHourAction } from "@/actions/tracking/energy";
import { KIND_STYLE, KIND_LABEL } from "@/lib/tracking-time-block-style";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_START = 6 * 60; // 6:00
const DAY_END = 23 * 60; // 23:00
const SLOT_MINUTES = 30;
const SLOT_COUNT = (DAY_END - DAY_START) / SLOT_MINUTES;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, "0")}`;
}
function minutesToTimeInput(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}
function timeInputToMinutes(value: string): number {
  const [h, mm] = value.split(":").map(Number);
  return h * 60 + mm;
}

// Weekly Planner - MVP KHONG keo-tha (xem plan): click 1 o trong mo form
// them block, click 1 block co san de sua/xoa. Luoi CSS grid tinh, dinh vi
// block bang gridRow theo slot 30 phut (khong phai keo-tha JS).
export function WeeklyPlannerShell({
  initialWeekStart,
  initialBlocks,
}: {
  initialWeekStart: string;
  initialBlocks: ApiTrackingTimeBlock[];
}) {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<
    | { mode: "create"; date: string; startMinute: number }
    | { mode: "edit"; block: ApiTrackingTimeBlock }
    | null
  >(null);
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState(60);
  const [kind, setKind] = useState<TrackingTimeBlockKind>("GENERAL");
  const [startMinuteDraft, setStartMinuteDraft] = useState(DAY_START);
  const [error, setError] = useState<string | null>(null);
  const [bestHour, setBestHour] = useState<ApiTrackingBestHour>(null);

  useEffect(() => {
    getTrackingBestHourAction().then(setBestHour).catch(() => setBestHour(null));
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  async function changeWeek(deltaDays: number) {
    const next = addDays(weekStart, deltaDays);
    setWeekStart(next);
    setIsLoading(true);
    const nextBlocks = await listTrackingTimeBlocksAction(next).catch(() => []);
    setBlocks(nextBlocks);
    setIsLoading(false);
  }

  function openCreate(date: string, startMinute: number) {
    setModal({ mode: "create", date, startMinute });
    setLabel("");
    setDuration(60);
    setKind("GENERAL");
    setStartMinuteDraft(startMinute);
    setError(null);
  }
  function openEdit(block: ApiTrackingTimeBlock) {
    setModal({ mode: "edit", block });
    setLabel(block.label);
    setDuration(block.endMinute - block.startMinute);
    setKind(block.kind);
    setStartMinuteDraft(block.startMinute);
    setError(null);
  }

  async function handleSave() {
    if (!label.trim() || !modal) return;
    setError(null);
    try {
      if (modal.mode === "create") {
        const created = await createTrackingTimeBlockAction({
          date: modal.date,
          startMinute: startMinuteDraft,
          endMinute: startMinuteDraft + duration,
          label: label.trim(),
          kind,
        });
        setBlocks((b) => [...b, created]);
      } else {
        const updated = await updateTrackingTimeBlockAction(modal.block.id, {
          startMinute: startMinuteDraft,
          endMinute: startMinuteDraft + duration,
          label: label.trim(),
          kind,
        });
        setBlocks((b) => b.map((x) => (x.id === updated.id ? updated : x)));
      }
      setModal(null);
    } catch {
      setError("Không lưu được, thử lại sau.");
    }
  }

  async function handleDelete() {
    if (modal?.mode !== "edit") return;
    const id = modal.block.id;
    setBlocks((b) => b.filter((x) => x.id !== id));
    setModal(null);
    await deleteTrackingTimeBlockAction(id).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-3">
      <TrackingPageHeader
        title="Lịch tuần"
        description="Chia thời gian trong tuần theo khối 30 phút/1 giờ: khối Tập trung cao cho việc khó nhất vào lúc minh mẫn nhất, khối Việc nhẹ cho tác vụ ít tốn năng lượng. Lịch cần bao quát cả sinh hoạt, ăn uống, tập thể dục và thời gian đệm — không chỉ mỗi việc học/làm."
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeWeek(-7)}
            className="cursor-pointer rounded-md border border-border p-1.5 hover:bg-hover-bg"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink">
            Tuần {days[0]} → {days[6]}
          </span>
          <button
            type="button"
            onClick={() => changeWeek(7)}
            className="cursor-pointer rounded-md border border-border p-1.5 hover:bg-hover-bg"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-faint">
          {(Object.keys(KIND_LABEL) as TrackingTimeBlockKind[]).map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span className={`inline-block h-2.5 w-2.5 rounded-full border ${KIND_STYLE[k]}`} />
              {KIND_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <div
          className={isLoading ? "opacity-50" : ""}
          style={{
            display: "grid",
            gridTemplateColumns: `56px repeat(7, minmax(110px, 1fr))`,
            minWidth: 850,
          }}
        >
          <div />
          {days.map((d, i) => (
            <div key={d} className="border-b border-l border-border px-2 py-2 text-center text-xs font-semibold text-ink">
              {DAY_LABELS[i]}
              <div className="font-normal text-ink-faint">{d.slice(5)}</div>
            </div>
          ))}

          {Array.from({ length: SLOT_COUNT }, (_, slot) => {
            const minute = DAY_START + slot * SLOT_MINUTES;
            return (
              <div key={`row-${slot}`} style={{ display: "contents" }}>
                <div className="border-b border-border px-1.5 py-1 text-right text-[10px] text-ink-faint">
                  {minute % 60 === 0 ? minutesToLabel(minute) : ""}
                </div>
                {days.map((d, dayIndex) => (
                  <button
                    key={`${d}-${slot}`}
                    type="button"
                    onClick={() => openCreate(d, minute)}
                    className="cursor-pointer border-b border-l border-border/60 hover:bg-hover-bg"
                    style={{ minHeight: 22 }}
                    aria-label={`Thêm khối ${DAY_LABELS[dayIndex]} ${minutesToLabel(minute)}`}
                  />
                ))}
              </div>
            );
          })}

          {days.map((d, dayIndex) =>
            blocks
              .filter((b) => b.date === d)
              .map((b) => {
                const startSlot = Math.max(0, Math.round((b.startMinute - DAY_START) / SLOT_MINUTES));
                const endSlot = Math.max(
                  startSlot + 1,
                  Math.round((b.endMinute - DAY_START) / SLOT_MINUTES),
                );
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => openEdit(b)}
                    className={`cursor-pointer overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-[11px] font-medium ${KIND_STYLE[b.kind]}`}
                    style={{
                      gridColumn: dayIndex + 2,
                      gridRow: `${startSlot + 2} / ${endSlot + 2}`,
                      margin: "1px 2px",
                    }}
                  >
                    {b.label}
                  </button>
                );
              }),
          )}
        </div>
      </div>

      <SimpleModal
        open={modal !== null}
        onOpenChange={(open) => !open && setModal(null)}
        title={modal?.mode === "edit" ? "Sửa khối thời gian" : "Thêm khối thời gian"}
        description={
          modal?.mode === "create"
            ? modal.date
            : modal?.mode === "edit"
              ? modal.block.date
              : undefined
        }
      >
        <div className="flex flex-col gap-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Việc cần làm"
            className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-faint">Bắt đầu</label>
            <input
              type="time"
              step={900}
              value={minutesToTimeInput(startMinuteDraft)}
              onChange={(e) => setStartMinuteDraft(timeInputToMinutes(e.target.value))}
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
            />
            <label className="ml-2 text-xs text-ink-faint">Kéo dài (phút)</label>
            <input
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="h-9 w-20 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>
          {kind === "FOCUSED" &&
            (bestHour ? (
              <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-2.5 py-2 text-xs text-violet-700">
                <Sparkles size={13} className="shrink-0" />
                <span className="flex-1">
                  Bạn thường có năng lượng tinh thần cao nhất lúc {minutesToLabel(bestHour.hour * 60)}
                  .
                </span>
                <button
                  type="button"
                  onClick={() => setStartMinuteDraft(bestHour.hour * 60)}
                  className="shrink-0 cursor-pointer rounded-full border border-violet-300 bg-surface px-2 py-0.5 font-medium hover:bg-violet-100"
                >
                  Dùng giờ này
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-ink-faint">
                Chưa đủ dữ liệu năng lượng để gợi ý giờ tốt nhất — chấm thêm ở trang Năng lượng.
              </p>
            ))}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(KIND_LABEL) as TrackingTimeBlockKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${
                  kind === k ? KIND_STYLE[k] : "border-border text-ink-muted"
                }`}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex items-center justify-between gap-2">
            {modal?.mode === "edit" ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs text-danger hover:bg-hover-bg"
              >
                <Trash2 size={14} /> Xoá
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!label.trim()}
              className="h-9 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
