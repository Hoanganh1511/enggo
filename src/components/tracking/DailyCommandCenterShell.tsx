"use client";

import { useEffect, useRef, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  Battery,
  BatteryLow,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Pause,
  Pin,
  Play,
  Sparkles,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type {
  ApiTrackingEnergyCheckin,
  ApiTrackingGroup,
  ApiTrackingTask,
  ApiTrackingTimeBlock,
  TrackingSkipReason,
} from "@/lib/api/tracking";
import {
  listTrackingTasksAction,
  createTrackingTaskAction,
  updateTrackingTaskAction,
  deleteTrackingTaskAction,
  postponeTrackingTaskAction,
} from "@/actions/tracking/daily";
import {
  createTrackingEnergyCheckinAction,
  listTrackingEnergyCheckinsAction,
} from "@/actions/tracking/energy";
import { listTrackingTimeBlocksAction } from "@/actions/tracking/weekly";
import {
  startTrackingGroupSessionAction,
  endTrackingGroupSessionAction,
} from "@/actions/tracking/accountability";
import { KIND_DOT, KIND_LABEL } from "@/lib/tracking-time-block-style";

const SKIP_REASONS: { value: TrackingSkipReason; label: string }[] = [
  { value: "AVOIDANCE", label: "Né tránh" },
  { value: "OUT_OF_TIME", label: "Hết thời gian" },
  { value: "INTERRUPTED", label: "Bị gián đoạn" },
  { value: "MISESTIMATED", label: "Ước tính sai" },
];
// Trì hoãn lần thứ 3 (postponedCount >= 2 = da "Dời sang mai" 2 lan, dang o
// ngay thu 3) moi hien khung "rescue" - dung 1 lan chua noi len gi ca.
const RESCUE_THRESHOLD = 2;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatStopwatch(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

// Vong Ngay (Hom nay <-> Nang luong <-> Review) - "Việc nên làm ngay" la 1
// hero card rieng NOI TRUOC list phang cu, doc checkin nang luong GAN NHAT
// hom nay de goi y tinh (khong tu dong xep lich), tich hop dong ho tap
// trung THUAN CLIENT (khong luu DB - xem plan). Postpone that (backend tao
// task moi ngay mai + tang postponedCount) thay cho sua ngay tai cho, de
// giu lai "lich su troi" phuc vu khung rescue.
export function DailyCommandCenterShell({
  initialDate,
  initialTasks,
  initialEnergyToday,
  groups,
  initialBlocks,
}: {
  initialDate: string;
  initialTasks: ApiTrackingTask[];
  initialEnergyToday: ApiTrackingEnergyCheckin[];
  groups: ApiTrackingGroup[];
  initialBlocks: ApiTrackingTimeBlock[];
}) {
  const [date, setDate] = useState(initialDate);
  const [tasks, setTasks] = useState(initialTasks);
  const [energyToday, setEnergyToday] = useState(initialEnergyToday);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [reviewNoteDraft, setReviewNoteDraft] = useState<Record<string, string>>({});
  const [quickEnergyOpen, setQuickEnergyOpen] = useState(false);
  const [quickEnergy, setQuickEnergy] = useState<Record<string, number>>({});
  const [isSavingEnergy, setIsSavingEnergy] = useState(false);
  const [isCreatingRescue, setIsCreatingRescue] = useState(false);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    groupName: string;
  } | null>(null);

  async function handleStartGroupSession(group: ApiTrackingGroup, taskTitle: string) {
    setGroupPickerOpen(false);
    const session = await startTrackingGroupSessionAction(group.id, taskTitle).catch(() => null);
    if (session) setActiveSession({ sessionId: session.id, groupName: group.name });
  }
  async function handleEndGroupSession(completed: boolean) {
    if (!activeSession) return;
    await endTrackingGroupSessionAction(activeSession.sessionId, completed).catch(() => {});
    setActiveSession(null);
  }

  const unfinished = tasks.filter((t) => !t.done);
  const doneCount = tasks.length - unfinished.length;
  const nextTask = [...unfinished].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  })[0] as ApiTrackingTask | undefined;
  const restTasks = tasks.filter((t) => t.id !== nextTask?.id);
  const latestEnergy = energyToday[energyToday.length - 1] ?? null;

  async function changeDate(next: string) {
    setDate(next);
    setIsLoading(true);
    const [nextTasks, nextEnergy, nextWeekBlocks] = await Promise.all([
      listTrackingTasksAction(next).catch(() => []),
      listTrackingEnergyCheckinsAction(next, next).catch(() => []),
      listTrackingTimeBlocksAction(next).catch(() => []),
    ]);
    setTasks(nextTasks);
    setEnergyToday(nextEnergy);
    setBlocks(nextWeekBlocks.filter((b) => b.date === next));
    setIsLoading(false);
  }

  async function handleAddTask() {
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    const created = await createTrackingTaskAction({ date, title }).catch(() => null);
    if (created) setTasks((t) => [...t, created]);
  }

  async function handleToggleDone(id: string, done: boolean) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done } : x)));
    await updateTrackingTaskAction(id, { done }).catch(() => {});
  }

  async function handleTogglePin(id: string, pinned: boolean) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, pinned } : x)));
    await updateTrackingTaskAction(id, { pinned }).catch(() => {});
  }

  async function handleDelete(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
    await deleteTrackingTaskAction(id).catch(() => {});
  }

  async function handleSkipReason(id: string, skipReason: TrackingSkipReason) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, skipReason } : x)));
    await updateTrackingTaskAction(id, { skipReason }).catch(() => {});
  }

  async function handleSaveReviewNote(id: string) {
    const reviewNote = (reviewNoteDraft[id] ?? "").trim();
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, reviewNote: reviewNote || null } : x)));
    await updateTrackingTaskAction(id, { reviewNote }).catch(() => {});
  }

  async function handlePostpone(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
    await postponeTrackingTaskAction(id).catch(() => {});
  }

  async function handleCreateRescueStep(originalTitle: string) {
    setIsCreatingRescue(true);
    const created = await createTrackingTaskAction({
      date,
      title: `${originalTitle} — khởi động 15 phút`,
    }).catch(() => null);
    if (created) setTasks((t) => [...t, created]);
    setIsCreatingRescue(false);
  }

  async function handleQuickEnergyPick(axis: "physical" | "emotional" | "mental", value: number) {
    const next = { ...quickEnergy, [axis]: value };
    setQuickEnergy(next);
    if (next.physical && next.emotional && next.mental) {
      setIsSavingEnergy(true);
      try {
        const created = await createTrackingEnergyCheckinAction({
          physical: next.physical,
          emotional: next.emotional,
          mental: next.mental,
        });
        setEnergyToday((e) => [...e, created]);
        setQuickEnergy({});
        setQuickEnergyOpen(false);
      } finally {
        setIsSavingEnergy(false);
      }
    }
  }

  const plannedMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
  const doneMinutes = tasks
    .filter((t) => t.done)
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <TrackingPageHeader
        title="Hôm nay"
        description="Lên kế hoạch việc cần làm trong ngày từ tối hôm trước hoặc sáng sớm, với các mục tiêu khả thi trong ngày. Việc quan trọng nhưng bị trì hoãn nhiều lần được ghim thành 'Bắt buộc'. Cuối ngày, soi chiếu lại để rút kinh nghiệm cho ngày sau."
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeDate(addDays(date, -1))}
          className="cursor-pointer rounded-md border border-border p-1.5 hover:bg-hover-bg"
        >
          <ChevronLeft size={16} />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => changeDate(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-ink outline-none"
        />
        <button
          type="button"
          onClick={() => changeDate(addDays(date, 1))}
          className="cursor-pointer rounded-md border border-border p-1.5 hover:bg-hover-bg"
        >
          <ChevronRight size={16} />
        </button>
        {tasks.length > 0 && (
          <span className="text-sm text-ink-faint">
            {doneCount}/{tasks.length} hoàn thành
          </span>
        )}
      </div>

      {nextTask && (
        <div
          className={`rounded-2xl border p-5 ${
            nextTask.postponedCount >= RESCUE_THRESHOLD
              ? "border-amber-300 bg-amber-50/60"
              : "border-indigo-200 bg-indigo-50/50"
          }`}
        >
          <p className="mb-1 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {nextTask.postponedCount >= RESCUE_THRESHOLD ? "Cần một cú hích nhỏ" : "Việc nên làm ngay"}
          </p>

          {nextTask.postponedCount >= RESCUE_THRESHOLD ? (
            <div>
              <h2 className="font-content text-lg font-bold text-ink">{nextTask.title}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Bạn đã dời việc này {nextTask.postponedCount} lần — thử bắt đầu bằng 1 bước nhỏ 15 phút
                thay vì cả việc lớn?
              </p>
              <button
                type="button"
                onClick={() => handleCreateRescueStep(nextTask.title)}
                disabled={isCreatingRescue}
                className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={15} /> Tạo bước khởi động 15 phút
              </button>
            </div>
          ) : (
            <h2 className="font-content text-lg font-bold text-ink">{nextTask.title}</h2>
          )}

          {nextTask.estimatedMinutes && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
              <CalendarClock size={12} /> Ước tính {nextTask.estimatedMinutes} phút
            </p>
          )}

          {/* Badge nang luong - doc checkin GAN NHAT hom nay, chi la 1 dong
              goi y tinh (khong tu dong xep lich). */}
          <div className="mt-3">
            {latestEnergy ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  latestEnergy.mental >= 4
                    ? "bg-emerald-100 text-emerald-700"
                    : latestEnergy.mental <= 2
                      ? "bg-amber-100 text-amber-700"
                      : "bg-surface-muted text-ink-muted"
                }`}
              >
                {latestEnergy.mental >= 4 ? <Battery size={13} /> : <BatteryLow size={13} />}
                {latestEnergy.mental >= 4
                  ? "Năng lượng tốt — hợp để làm việc khó"
                  : latestEnergy.mental <= 2
                    ? "Năng lượng thấp — cân nhắc việc nhẹ hơn"
                    : "Năng lượng trung bình"}
              </span>
            ) : quickEnergyOpen ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface p-2.5">
                {(
                  [
                    { key: "physical", label: "Thể chất" },
                    { key: "emotional", label: "Cảm xúc" },
                    { key: "mental", label: "Tinh thần" },
                  ] as const
                ).map((axis) => (
                  <div key={axis.key} className="flex items-center gap-1">
                    <span className="mr-1 text-[11px] text-ink-faint">{axis.label}</span>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        disabled={isSavingEnergy}
                        onClick={() => handleQuickEnergyPick(axis.key, v)}
                        className={`flex size-6 cursor-pointer items-center justify-center rounded-full border text-[11px] font-semibold ${
                          quickEnergy[axis.key] === v
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-border text-ink-muted hover:bg-hover-bg"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setQuickEnergyOpen(true)}
                className="cursor-pointer rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink-muted hover:bg-hover-bg"
              >
                Chấm nhanh năng lượng
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* key={nextTask.id} - doi hero task se MOUNT LAI component nay
                tu dau, tu dong reset dong ho ve 0 (khong can effect nao
                setState theo doi nextTask.id). */}
            <FocusTimer key={nextTask.id} />
            <button
              type="button"
              onClick={() => handleToggleDone(nextTask.id, true)}
              className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Hoàn thành
            </button>
            <button
              type="button"
              onClick={() => handlePostpone(nextTask.id)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink-faint hover:bg-hover-bg hover:text-ink"
            >
              Dời sang mai
            </button>

            {/* Accountability long vao Execution - "Tôi muốn làm cùng nhóm"
                (xem plan muc E) - tai dung 100% API Accountability da co,
                khong model moi. */}
            {activeSession ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="text-ink-muted">
                  Đang cùng nhóm <span className="font-semibold text-ink">{activeSession.groupName}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleEndGroupSession(true)}
                  className="ml-2 flex cursor-pointer items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Square size={11} /> Hoàn thành
                </button>
                <button
                  type="button"
                  onClick={() => handleEndGroupSession(false)}
                  className="cursor-pointer rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted hover:bg-hover-bg"
                >
                  Bỏ dở
                </button>
              </div>
            ) : groups.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGroupPickerOpen((v) => !v)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-muted hover:bg-hover-bg"
                >
                  <Users size={14} /> Làm cùng nhóm
                </button>
                {groupPickerOpen && (
                  <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleStartGroupSession(g, nextTask.title)}
                        className="block w-full cursor-pointer rounded-md px-2.5 py-1.5 text-left text-sm text-ink hover:bg-hover-bg"
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-3.5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Lịch trình hôm nay
          </p>
          <div className="flex flex-col gap-1">
            {[...blocks]
              .sort((a, b) => a.startMinute - b.startMinute)
              .map((b) => (
                <div key={b.id} className="flex items-center gap-2 py-0.5 text-sm">
                  <span className="w-11 shrink-0 text-xs text-ink-faint">
                    {minutesToLabel(b.startMinute)}
                  </span>
                  <span className={`size-1.5 shrink-0 rounded-full ${KIND_DOT[b.kind]}`} />
                  <span className="flex-1 truncate text-ink">{b.label}</span>
                  <span className="shrink-0 text-[11px] text-ink-faint">{KIND_LABEL[b.kind]}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={`flex items-center gap-1.5 ${isLoading ? "opacity-50" : ""}`}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTask();
          }}
          placeholder="Thêm việc cần làm hôm nay..."
          className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary/50"
        />
        <button
          type="button"
          onClick={handleAddTask}
          disabled={!draft.trim()}
          className="h-10 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Thêm
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-faint">
            Chưa có việc nào cho ngày này.
          </p>
        ) : (
          restTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 rounded-xl border bg-surface p-3 ${
                task.pinned ? "border-danger/50" : "border-border"
              }`}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={(e) => handleToggleDone(task.id, e.target.checked)}
                className="size-4 shrink-0 cursor-pointer accent-primary"
              />
              <span className={task.done ? "flex-1 text-ink-faint line-through" : "flex-1 text-sm text-ink"}>
                {task.title}
              </span>
              {task.pinned && (
                <span className="shrink-0 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                  Bắt buộc
                </span>
              )}
              <button
                type="button"
                onClick={() => handleTogglePin(task.id, !task.pinned)}
                className={`shrink-0 cursor-pointer rounded-md p-1.5 hover:bg-hover-bg ${
                  task.pinned ? "text-danger" : "text-ink-faint"
                }`}
                aria-label="Ghim bắt buộc"
              >
                <Pin size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                className="shrink-0 cursor-pointer rounded-md p-1.5 text-ink-faint hover:bg-hover-bg hover:text-danger"
                aria-label="Xoá"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            className="cursor-pointer text-sm font-semibold text-ink hover:text-primary"
          >
            {showReview ? "Ẩn đánh giá cuối ngày" : "Đánh giá cuối ngày →"}
          </button>
          {showReview && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Xong", value: doneCount },
                          { name: "Còn lại", value: Math.max(0, tasks.length - doneCount) },
                        ]}
                        dataKey="value"
                        innerRadius={22}
                        outerRadius={30}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill="var(--primary)" />
                        <Cell fill="var(--border)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink">
                    {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <p className="text-xs text-ink-faint">
                  Kế hoạch: {tasks.length} việc (~{plannedMinutes} phút) · Đã xong: {doneCount} việc (~
                  {doneMinutes} phút)
                  <br />
                  <span className="text-ink-faint/70">(*ước tính, không phải đo chính xác)</span>
                </p>
              </div>
              {unfinished.length === 0 ? (
                <p className="text-sm text-ink-muted">Bạn đã hoàn thành hết việc hôm nay 🎉</p>
              ) : (
                unfinished.map((task) => (
                  <div key={task.id} className="rounded-lg bg-surface-muted p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-ink">{task.title}</p>
                      <button
                        type="button"
                        onClick={() => handlePostpone(task.id)}
                        className="shrink-0 cursor-pointer text-xs text-ink-faint hover:text-ink"
                      >
                        Dời sang mai
                      </button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {SKIP_REASONS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => handleSkipReason(task.id, r.value)}
                          className={`cursor-pointer rounded-full border px-2 py-0.5 text-[11px] ${
                            task.skipReason === r.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-ink-muted hover:bg-hover-bg"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {task.skipReason && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <input
                          value={reviewNoteDraft[task.id] ?? task.reviewNote ?? ""}
                          onChange={(e) =>
                            setReviewNoteDraft((d) => ({ ...d, [task.id]: e.target.value }))
                          }
                          onBlur={() => handleSaveReviewNote(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveReviewNote(task.id);
                          }}
                          placeholder="Điều gì đã xảy ra? (tuỳ chọn)"
                          className="h-7 flex-1 rounded-md border border-border bg-surface px-2 text-xs text-ink outline-none focus:border-primary/50"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Dong ho tap trung THUAN CLIENT (khong luu DB, xem plan) - tach rieng +
// mount voi key={nextTask.id} o component cha de tu reset khi doi hero
// task, tranh setState dong bo trong effect (react-hooks/set-state-in-effect).
function FocusTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function toggle() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:bg-hover-bg"
    >
      {running ? <Pause size={15} /> : <Play size={15} />}
      {seconds > 0 ? formatStopwatch(seconds) : "Bắt đầu tập trung"}
    </button>
  );
}
