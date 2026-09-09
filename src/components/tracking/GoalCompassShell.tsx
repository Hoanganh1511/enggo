"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Compass,
  Flag,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type {
  ApiTrackingGoal,
  ApiTrackingGoalStep,
  ApiTrackingMilestone,
  ApiTrackingRealityCheck,
} from "@/lib/api/tracking";
import {
  createTrackingGoalAction,
  deleteTrackingGoalAction,
  updateTrackingGoalAction,
  createTrackingMilestoneAction,
  updateTrackingMilestoneAction,
  deleteTrackingMilestoneAction,
  createTrackingGoalStepAction,
  createTrackingGoalStepUnderMilestoneAction,
  updateTrackingGoalStepAction,
  deleteTrackingGoalStepAction,
  upsertTrackingSettingsAction,
} from "@/actions/tracking/goals";
import { createTrackingTimeBlockAction } from "@/actions/tracking/weekly";

type View = "list" | "matrix";

const QUADRANTS = [
  {
    important: true,
    controllable: true,
    label: "Quan trọng · Kiểm soát được",
    shortLabel: "Ưu tiên cao",
    hint: "Ưu tiên cao nhất — dồn sức vào đây",
    tint: "border-indigo-200 bg-indigo-50/60",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-600",
  },
  {
    important: true,
    controllable: false,
    label: "Quan trọng · Ngoài kiểm soát",
    shortLabel: "Cần dự phòng",
    hint: "Chuẩn bị phương án dự phòng",
    tint: "border-amber-200 bg-amber-50/60",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  {
    important: false,
    controllable: true,
    label: "Không quan trọng · Kiểm soát được",
    shortLabel: "Làm khi rảnh",
    hint: "Làm khi còn dư thời gian",
    tint: "border-sky-200 bg-sky-50/60",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-600",
  },
  {
    important: false,
    controllable: false,
    label: "Không quan trọng · Ngoài kiểm soát",
    shortLabel: "Cân nhắc bỏ",
    hint: "Cân nhắc bỏ bớt",
    tint: "border-border bg-surface-muted/60",
    dot: "bg-ink-faint",
    badge: "bg-surface-muted text-ink-faint",
  },
] as const;

function quadrantOf(goal: { important: boolean; controllable: boolean }) {
  return (
    QUADRANTS.find((q) => q.important === goal.important && q.controllable === goal.controllable) ??
    QUADRANTS[0]
  );
}

// Ngay con lai toi han - dung mau canh bao mau sac cho card (do <=2 ngay,
// amber <=7 ngay, trung tinh con lai) - lam ro "muc tieu nao dang gap".
function deadlineUrgency(targetDate: string | null): "overdue" | "soon" | "normal" | null {
  if (!targetDate) return null;
  const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "overdue";
  if (days <= 7) return "soon";
  return "normal";
}
const URGENCY_TEXT: Record<"overdue" | "soon" | "normal", string> = {
  overdue: "text-danger",
  soon: "text-amber-600",
  normal: "text-ink-faint",
};

// Fallback (?? []) - phong ho response cu tu 1 backend chua restart (chua co
// field milestones/steps trong toApi() moi), khong de crash trang luc dev.
function goalAllSteps(goal: ApiTrackingGoal): ApiTrackingGoalStep[] {
  return [...(goal.steps ?? []), ...(goal.milestones ?? []).flatMap((m) => m.steps ?? [])];
}

// Buoc chua xong, uu tien co dueDate gan nhat, sau do theo orderIndex - dung
// lam "BUOC TIEP THEO" tren card.
function nextActionOf(goal: ApiTrackingGoal): ApiTrackingGoalStep | null {
  const undone = goalAllSteps(goal).filter((s) => !s.done);
  if (undone.length === 0) return null;
  return [...undone].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.orderIndex - b.orderIndex;
  })[0];
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Goal Compass - Goal -> Milestone -> Action (Step), Reality Check, Ma tran
// uu tien la nut BAM (khong keo-tha). Card khong chi liet ke ma tra loi 4
// cau: dang huong toi gi / phai di qua dau / tuan nay can tien bao nhieu /
// buoc tiep theo la gi.
export function GoalCompassShell({
  initialGoals,
  initialRealityCheck,
}: {
  initialGoals: ApiTrackingGoal[];
  initialRealityCheck: ApiTrackingRealityCheck | null;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [realityCheck, setRealityCheck] = useState(initialRealityCheck);
  const [rcExpanded, setRcExpanded] = useState(false);
  const [view, setView] = useState<View>("list");
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [why, setWhy] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [priorityKey, setPriorityKey] = useState(`${QUADRANTS[0].important}-${QUADRANTS[0].controllable}`);
  const [error, setError] = useState<string | null>(null);
  const [milestoneDraft, setMilestoneDraft] = useState<Record<string, string>>({});
  const [stepDraftTitle, setStepDraftTitle] = useState<Record<string, string>>({});
  const [stepDraftMinutes, setStepDraftMinutes] = useState<Record<string, string>>({});
  const [stepDraftDueDate, setStepDraftDueDate] = useState<Record<string, string>>({});
  const [orphanAddOpen, setOrphanAddOpen] = useState<Record<string, boolean>>({});
  const [weeklyHoursDraft, setWeeklyHoursDraft] = useState(
    String(initialRealityCheck?.availableHours ?? 20),
  );
  const stepInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [scheduleTarget, setScheduleTarget] = useState<{
    goalId: string;
    step: ApiTrackingGoalStep;
  } | null>(null);
  const [scheduleDate, setScheduleDate] = useState(tomorrowIso());
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDuration, setScheduleDuration] = useState(60);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  async function handleCreateGoal() {
    if (!title.trim() || !category.trim()) return;
    setError(null);
    try {
      const priorityQuadrant = QUADRANTS.find(
        (q) => `${q.important}-${q.controllable}` === priorityKey,
      );
      const created = await createTrackingGoalAction({
        title: title.trim(),
        category: category.trim(),
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
        why: why.trim() || undefined,
        estimatedHoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        important: priorityQuadrant?.important,
        controllable: priorityQuadrant?.controllable,
      });
      setGoals((g) => [...g, created]);
      setTitle("");
      setCategory("");
      setStartDate("");
      setTargetDate("");
      setWhy("");
      setHoursPerWeek("");
      setPriorityKey(`${QUADRANTS[0].important}-${QUADRANTS[0].controllable}`);
      setAddOpen(false);
    } catch {
      setError("Không tạo được mục tiêu, thử lại sau.");
    }
  }

  async function handleDeleteGoal(id: string) {
    setGoals((g) => g.filter((x) => x.id !== id));
    await deleteTrackingGoalAction(id).catch(() => {});
  }

  async function handleSetQuadrant(
    goal: ApiTrackingGoal,
    next: { important: boolean; controllable: boolean },
  ) {
    setGoals((gs) => gs.map((g) => (g.id === goal.id ? { ...g, ...next } : g)));
    await updateTrackingGoalAction(goal.id, next).catch(() => {});
  }

  async function handleAddMilestone(goalId: string) {
    const value = (milestoneDraft[goalId] ?? "").trim();
    if (!value) return;
    setMilestoneDraft((d) => ({ ...d, [goalId]: "" }));
    const milestone = await createTrackingMilestoneAction(goalId, { title: value }).catch(
      () => null,
    );
    if (milestone) {
      setGoals((gs) =>
        gs.map((g) => (g.id === goalId ? { ...g, milestones: [...g.milestones, milestone] } : g)),
      );
    }
  }

  async function handleDeleteMilestone(goalId: string, milestoneId: string) {
    setGoals((gs) =>
      gs.map((g) =>
        g.id === goalId
          ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
          : g,
      ),
    );
    await deleteTrackingMilestoneAction(milestoneId).catch(() => {});
  }

  async function handleSaveWeeklyNote(goalId: string, milestoneId: string, note: string) {
    const value = note.trim();
    setGoals((gs) =>
      gs.map((g) =>
        g.id !== goalId
          ? g
          : {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, weeklyGoalNote: value || null } : m,
              ),
            },
      ),
    );
    await updateTrackingMilestoneAction(milestoneId, { weeklyGoalNote: value }).catch(() => {});
  }

  // `context` = goalId (step truc tiep duoi goal) hoac milestoneId (step
  // duoi 1 milestone) - dung chung 1 cap state draft (title+minutes+dueDate)
  // keyed theo id do, tranh nhan doi state cho 2 truong hop.
  async function handleAddStep(goalId: string, milestoneId: string | null) {
    const contextKey = milestoneId ?? goalId;
    const value = (stepDraftTitle[contextKey] ?? "").trim();
    if (!value) return;
    const minutesRaw = stepDraftMinutes[contextKey];
    const estimatedMinutes = minutesRaw ? Number(minutesRaw) : undefined;
    const dueDate = stepDraftDueDate[contextKey] || undefined;
    setStepDraftTitle((d) => ({ ...d, [contextKey]: "" }));
    setStepDraftMinutes((d) => ({ ...d, [contextKey]: "" }));
    setStepDraftDueDate((d) => ({ ...d, [contextKey]: "" }));
    const step = milestoneId
      ? await createTrackingGoalStepUnderMilestoneAction(milestoneId, {
          title: value,
          estimatedMinutes,
          dueDate,
        }).catch(() => null)
      : await createTrackingGoalStepAction(goalId, {
          title: value,
          estimatedMinutes,
          dueDate,
        }).catch(() => null);
    if (!step) return;
    setGoals((gs) =>
      gs.map((g) => {
        if (g.id !== goalId) return g;
        if (milestoneId) {
          return {
            ...g,
            milestones: g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, steps: [...m.steps, step] } : m,
            ),
          };
        }
        return { ...g, steps: [...g.steps, step] };
      }),
    );
    if (realityCheck && step.estimatedMinutes) {
      setRealityCheck((rc) =>
        rc
          ? {
              ...rc,
              neededHours: Math.round((rc.neededHours + step.estimatedMinutes! / 60) * 10) / 10,
            }
          : rc,
      );
    }
  }

  function focusStepInput(key: string) {
    const el = stepInputRefs.current[key];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
  }

  function patchStepInGoals(
    goalId: string,
    milestoneId: string | null,
    stepId: string,
    patch: Partial<ApiTrackingGoalStep>,
  ) {
    setGoals((gs) =>
      gs.map((g) => {
        if (g.id !== goalId) return g;
        if (milestoneId) {
          return {
            ...g,
            milestones: g.milestones.map((m) =>
              m.id === milestoneId
                ? { ...m, steps: m.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)) }
                : m,
            ),
          };
        }
        return { ...g, steps: g.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)) };
      }),
    );
  }

  async function handleToggleStep(
    goalId: string,
    milestoneId: string | null,
    stepId: string,
    done: boolean,
  ) {
    patchStepInGoals(goalId, milestoneId, stepId, { done });
    await updateTrackingGoalStepAction(stepId, { done }).catch(() => {});
  }

  async function handleDeleteStep(goalId: string, milestoneId: string | null, stepId: string) {
    setGoals((gs) =>
      gs.map((g) => {
        if (g.id !== goalId) return g;
        if (milestoneId) {
          return {
            ...g,
            milestones: g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, steps: m.steps.filter((s) => s.id !== stepId) } : m,
            ),
          };
        }
        return { ...g, steps: g.steps.filter((s) => s.id !== stepId) };
      }),
    );
    await deleteTrackingGoalStepAction(stepId).catch(() => {});
  }

  async function handleSaveWeeklyHours() {
    const value = Number(weeklyHoursDraft);
    if (Number.isNaN(value) || value < 0) return;
    const result = await upsertTrackingSettingsAction(value).catch(() => null);
    if (result) {
      setRealityCheck((rc) =>
        rc
          ? {
              ...rc,
              availableHours: result.weeklyAvailableHours,
              overloadHours: Math.max(
                0,
                Math.round((rc.neededHours - result.weeklyAvailableHours) * 10) / 10,
              ),
            }
          : rc,
      );
    }
  }

  function openSchedule(goalId: string, step: ApiTrackingGoalStep) {
    setScheduleTarget({ goalId, step });
    setScheduleDate(step.dueDate ?? tomorrowIso());
    setScheduleTime("09:00");
    setScheduleDuration(step.estimatedMinutes ?? 60);
    setScheduleError(null);
  }

  async function handleConfirmSchedule() {
    if (!scheduleTarget) return;
    const [hh, mm] = scheduleTime.split(":").map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return;
    const startMinute = hh * 60 + mm;
    setScheduleSaving(true);
    setScheduleError(null);
    try {
      await createTrackingTimeBlockAction({
        date: scheduleDate,
        startMinute,
        endMinute: startMinute + scheduleDuration,
        label: scheduleTarget.step.title,
        kind: "FOCUSED",
        goalStepId: scheduleTarget.step.id,
      });
      setScheduleTarget(null);
    } catch {
      setScheduleError("Không thêm được vào lịch tuần, thử lại sau.");
    } finally {
      setScheduleSaving(false);
    }
  }

  const sortedGoals = [...goals].sort((a, b) => {
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return a.targetDate.localeCompare(b.targetDate);
  });

  const atRiskCount = goals.filter((g) => {
    const urgency = deadlineUrgency(g.targetDate);
    if (urgency !== "overdue" && urgency !== "soon") return false;
    return goalAllSteps(g).some((s) => !s.done);
  }).length;

  return (
    <div className="flex flex-col gap-5">
      <TrackingPageHeader
        title="Mục tiêu"
        description="Đặt 1–2 mục tiêu cụ thể, đo lường được cho mỗi lĩnh vực vào đầu giai đoạn lớn. Bản đồ hoá hạn chót cố định, chia nhỏ mục tiêu thành các mốc và bước, và dùng Ma trận ưu tiên (quan trọng x kiểm soát được) để biết nên tập trung vào đâu và sẵn sàng điều chỉnh khi hoàn cảnh thay đổi."
      />

      <div className="flex flex-col gap-2">
        <p className="font-content text-sm text-ink-muted italic">
          Điều gì thực sự đáng để bạn dành thời gian cho giai đoạn này?
        </p>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
          <p>
            <span className="font-content text-lg font-bold text-ink">{goals.length}</span>{" "}
            <span className="text-ink-faint">mục tiêu đang hoạt động</span>
          </p>
          {realityCheck && (
            <p>
              <span className="font-content text-lg font-bold text-ink">
                {realityCheck.neededHours}h
              </span>{" "}
              <span className="text-ink-faint">/ {realityCheck.availableHours}h khả dụng tuần này</span>
            </p>
          )}
          {atRiskCount > 0 && (
            <p className="text-amber-600">
              <span className="font-content text-lg font-bold">{atRiskCount}</span> mục tiêu có nguy
              cơ trễ hạn
            </p>
          )}
        </div>
      </div>

      {realityCheck && (
        <div
          className={`overflow-hidden rounded-2xl border transition ${
            realityCheck.overloadHours > 0
              ? "border-amber-300 bg-amber-50/60"
              : "border-indigo-200 bg-indigo-50/50"
          }`}
        >
          <button
            type="button"
            onClick={() => setRcExpanded((v) => !v)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left"
          >
            <div className="flex items-center gap-2.5">
              {realityCheck.overloadHours > 0 ? (
                <AlertTriangle size={18} className="shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 size={18} className="shrink-0 text-indigo-500" />
              )}
              <div>
                <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                  Khả năng thực hiện
                </p>
                <p className="font-content text-sm font-medium text-ink">
                  {realityCheck.neededHours}h cần thiết · {realityCheck.availableHours}h khả dụng
                  {realityCheck.overloadHours > 0 && (
                    <span className="text-amber-700"> — quá tải {realityCheck.overloadHours}h</span>
                  )}
                </p>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`shrink-0 text-ink-faint transition-transform ${rcExpanded ? "rotate-180" : ""}`}
            />
          </button>
          {rcExpanded && (
            <div className="border-t border-black/5 px-4 pb-4 pt-3">
              <div className="flex items-end gap-4">
                <div>
                  <p className="font-content text-2xl font-bold text-ink">
                    {realityCheck.neededHours}h
                  </p>
                  <p className="text-xs text-ink-faint">Đang lên kế hoạch</p>
                </div>
                <span className="mb-1 text-ink-faint">so với</span>
                <div>
                  <p className="font-content text-2xl font-bold text-ink">
                    {realityCheck.availableHours}h
                  </p>
                  <p className="text-xs text-ink-faint">Khả năng thực tế/tuần</p>
                </div>
              </div>
              {realityCheck.overloadHours > 0 ? (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Bạn đang cố nhét nhiều hơn khả năng thực tế {realityCheck.overloadHours} giờ — cân
                  nhắc giảm scope, dời mốc, hoặc bỏ bớt việc ít quan trọng.
                </p>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">Khối lượng đang trong tầm kiểm soát.</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-ink-faint">Giờ rảnh thật/tuần:</label>
                <input
                  type="number"
                  min={0}
                  value={weeklyHoursDraft}
                  onChange={(e) => setWeeklyHoursDraft(e.target.value)}
                  className="h-8 w-20 rounded-md border border-border bg-surface px-2 text-sm text-ink outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={handleSaveWeeklyHours}
                  className="cursor-pointer rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-hover-bg"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-border bg-surface-muted/60 p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
              view === "list" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted"
            }`}
          >
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setView("matrix")}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
              view === "matrix" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted"
            }`}
          >
            Ma trận ưu tiên
          </button>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          <Plus size={16} /> Mục tiêu mới
        </button>
      </div>

      {sortedGoals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface/60 py-14 text-center">
          <Compass size={28} className="text-indigo-300" strokeWidth={1.5} />
          <p className="mt-1 text-sm text-ink-faint">
            Chưa có mục tiêu nào — bắt đầu với 1-2 mục tiêu cụ thể cho giai đoạn này.
          </p>
        </div>
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          {sortedGoals.map((goal) => {
            const urgency = deadlineUrgency(goal.targetDate);
            const allSteps = goalAllSteps(goal);
            const doneCount = allSteps.filter((s) => s.done).length;
            const progress = allSteps.length > 0 ? (doneCount / allSteps.length) * 100 : 0;
            const quadrant = quadrantOf(goal);
            const nextAction = nextActionOf(goal);
            const milestones = goal.milestones ?? [];
            const orphanSteps = goal.steps ?? [];
            return (
              <div
                key={goal.id}
                className="group rounded-2xl border border-border/70 bg-surface p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                        {goal.category}
                      </span>
                      <QuadrantSelect goal={goal} quadrant={quadrant} onChange={(next) => handleSetQuadrant(goal, next)} />
                    </div>
                    <h3 className="font-content mt-2 text-[15px] font-bold text-ink">
                      {goal.title}
                    </h3>
                    {goal.why && (
                      <p className="font-content mt-1 text-xs text-ink-muted italic">
                        &ldquo;{goal.why}&rdquo;
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {goal.startDate && (
                        <p className="flex items-center gap-1 text-xs text-ink-faint">
                          <Calendar size={12} />
                          Bắt đầu: {goal.startDate}
                        </p>
                      )}
                      {goal.targetDate && urgency && (
                        <p className={`flex items-center gap-1 text-xs font-medium ${URGENCY_TEXT[urgency]}`}>
                          <Calendar size={12} />
                          Hạn: {goal.targetDate}
                          {urgency === "overdue" && " — đã quá hạn"}
                          {urgency === "soon" && " — sắp tới"}
                        </p>
                      )}
                      {allSteps.length > 0 && (
                        <p className="text-xs text-ink-faint">
                          {doneCount}/{allSteps.length} bước
                        </p>
                      )}
                      {goal.estimatedHoursPerWeek != null && (
                        <p className="text-xs text-ink-faint">
                          ~{goal.estimatedHoursPerWeek}h/tuần dự kiến
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="cursor-pointer rounded-lg p-1.5 text-ink-faint opacity-0 transition hover:bg-hover-bg hover:text-danger group-hover:opacity-100"
                    aria-label="Xoá mục tiêu"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {allSteps.length > 0 && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {milestones.length > 0 && (
                  <div className="mt-3.5">
                    <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                      Mốc tiến độ
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {milestones.map((m) => {
                        const total = m.steps.length;
                        const done = m.steps.filter((s) => s.done).length;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        const icon = total > 0 && done === total ? "✓" : done > 0 ? "●" : "○";
                        return (
                          <div key={m.id} className="flex items-center gap-1.5 text-xs">
                            <span
                              className={
                                total > 0 && done === total ? "text-indigo-500" : "text-ink-faint"
                              }
                            >
                              {icon}
                            </span>
                            <span className="flex-1 truncate text-ink-muted">{m.title}</span>
                            <span className="shrink-0 text-ink-faint">{total > 0 ? `${pct}%` : "—"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {nextAction && (
                  <div className="mt-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                    <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                      Bước tiếp theo
                    </p>
                    <p className="font-content mt-1 text-sm font-medium text-ink">{nextAction.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-faint">
                      {nextAction.estimatedMinutes != null && <span>{nextAction.estimatedMinutes} phút</span>}
                      {nextAction.dueDate && <span>Hạn: {nextAction.dueDate}</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => focusStepInput(nextAction.milestoneId ?? goal.id)}
                        className="cursor-pointer rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:bg-hover-bg"
                      >
                        Thêm bước
                      </button>
                      <button
                        type="button"
                        onClick={() => openSchedule(goal.id, nextAction)}
                        className="flex cursor-pointer items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                      >
                        <CalendarClock size={12} /> Đưa vào lịch tuần
                      </button>
                    </div>
                  </div>
                )}

                {/* Milestone (Decompose stage) - moi milestone co list step + Weekly Commitment rieng */}
                <div className="mt-3.5 flex flex-col gap-3">
                  {milestones.map((milestone) => (
                    <MilestoneBlock
                      key={milestone.id}
                      milestone={milestone}
                      stepDraftTitle={stepDraftTitle[milestone.id] ?? ""}
                      stepDraftMinutes={stepDraftMinutes[milestone.id] ?? ""}
                      stepDraftDueDate={stepDraftDueDate[milestone.id] ?? ""}
                      onStepTitleChange={(v) =>
                        setStepDraftTitle((d) => ({ ...d, [milestone.id]: v }))
                      }
                      onStepMinutesChange={(v) =>
                        setStepDraftMinutes((d) => ({ ...d, [milestone.id]: v }))
                      }
                      onStepDueDateChange={(v) =>
                        setStepDraftDueDate((d) => ({ ...d, [milestone.id]: v }))
                      }
                      onAddStep={() => handleAddStep(goal.id, milestone.id)}
                      onToggleStep={(stepId, done) =>
                        handleToggleStep(goal.id, milestone.id, stepId, done)
                      }
                      onDeleteStep={(stepId) => handleDeleteStep(goal.id, milestone.id, stepId)}
                      onDeleteMilestone={() => handleDeleteMilestone(goal.id, milestone.id)}
                      onSaveWeeklyNote={(note) => handleSaveWeeklyNote(goal.id, milestone.id, note)}
                      registerStepInputRef={(el) => {
                        stepInputRefs.current[milestone.id] = el;
                      }}
                    />
                  ))}

                  <div
                    className={
                      milestones.length === 0
                        ? "rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-3"
                        : "flex items-center gap-1.5 px-1"
                    }
                  >
                    <Flag size={12} className="shrink-0 text-ink-faint" />
                    <input
                      value={milestoneDraft[goal.id] ?? ""}
                      onChange={(e) =>
                        setMilestoneDraft((d) => ({ ...d, [goal.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddMilestone(goal.id);
                      }}
                      placeholder={
                        milestones.length === 0 ? "+ Tạo mốc đầu tiên..." : "Thêm mốc (milestone)..."
                      }
                      className={
                        milestones.length === 0
                          ? "h-7 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-indigo-400"
                          : "h-7 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-ink-faint placeholder:font-normal"
                      }
                    />
                  </div>

                  {/* Step chua gan milestone nao (du lieu cu / co tinh khong gan) - hien
                      thi data cu binh thuong, nhung hang "them moi" thu gon lai thanh
                      lien ket phu, khong khuyen khich tao them step roi rac. */}
                  {orphanSteps.length > 0 && (
                    <div className="rounded-xl bg-surface-muted/50 p-3">
                      <p className="mb-1.5 text-[11px] font-semibold text-ink-faint uppercase">
                        Khác (chưa gán mốc)
                      </p>
                      <StepList
                        steps={orphanSteps}
                        onToggle={(stepId, done) => handleToggleStep(goal.id, null, stepId, done)}
                        onDelete={(stepId) => handleDeleteStep(goal.id, null, stepId)}
                      />
                    </div>
                  )}
                  {milestones.length > 0 &&
                    (orphanAddOpen[goal.id] ? (
                      <div className="flex items-center gap-1.5 px-1">
                        <CircleDot size={12} className="shrink-0 text-ink-faint" />
                        <input
                          ref={(el) => {
                            stepInputRefs.current[goal.id] = el;
                          }}
                          value={stepDraftTitle[goal.id] ?? ""}
                          onChange={(e) =>
                            setStepDraftTitle((d) => ({ ...d, [goal.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddStep(goal.id, null);
                          }}
                          placeholder="Tên hành động..."
                          className="h-7 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint"
                        />
                        <input
                          type="number"
                          min={1}
                          value={stepDraftMinutes[goal.id] ?? ""}
                          onChange={(e) =>
                            setStepDraftMinutes((d) => ({ ...d, [goal.id]: e.target.value }))
                          }
                          placeholder="phút"
                          className="h-7 w-14 shrink-0 rounded-md border border-border bg-transparent px-1.5 text-xs text-ink outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOrphanAddOpen((d) => ({ ...d, [goal.id]: true }))}
                        className="cursor-pointer self-start px-1 text-[11px] text-ink-faint hover:text-ink-muted hover:underline"
                      >
                        + Thêm hành động khác (không thuộc mốc)
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUADRANTS.map((quadrant) => (
            <div key={quadrant.label} className={`rounded-2xl border p-4 ${quadrant.tint}`}>
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${quadrant.dot}`} />
                <p className="text-xs font-semibold text-ink">{quadrant.label}</p>
              </div>
              <p className="mb-3 text-[11px] text-ink-faint">{quadrant.hint}</p>
              <div className="flex flex-col gap-2">
                {sortedGoals
                  .filter(
                    (g) =>
                      g.important === quadrant.important && g.controllable === quadrant.controllable,
                  )
                  .map((goal) => (
                    <div key={goal.id} className="rounded-xl bg-surface p-3 text-sm shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-ink">{goal.title}</p>
                        <QuadrantSelect
                          goal={goal}
                          quadrant={quadrantOf(goal)}
                          onChange={(next) => handleSetQuadrant(goal, next)}
                        />
                      </div>
                    </div>
                  ))}
                {sortedGoals.filter(
                  (g) => g.important === quadrant.important && g.controllable === quadrant.controllable,
                ).length === 0 && <p className="text-xs text-ink-faint/70">Chưa có mục tiêu.</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <SimpleModal open={addOpen} onOpenChange={setAddOpen} title="Mục tiêu mới">
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-faint">Tên mục tiêu</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cụ thể, đo lường được"
              className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-faint">
              Vì sao mục tiêu này quan trọng (tuỳ chọn)
            </label>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              rows={2}
              placeholder="Điều gì khiến bạn muốn dành thời gian cho việc này?"
              className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-ink outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-faint">Lĩnh vực</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Vd Học tập, Sức khoẻ..."
              className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Hạn hoàn thành</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Mức ưu tiên</label>
              <select
                value={priorityKey}
                onChange={(e) => setPriorityKey(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              >
                {QUADRANTS.map((q) => (
                  <option key={`${q.important}-${q.controllable}`} value={`${q.important}-${q.controllable}`}>
                    {q.shortLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Giờ/tuần</label>
              <input
                type="number"
                min={0}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="button"
            onClick={handleCreateGoal}
            disabled={!title.trim() || !category.trim()}
            className="h-9 cursor-pointer rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tạo mục tiêu
          </button>
        </div>
      </SimpleModal>

      <SimpleModal
        open={scheduleTarget != null}
        onOpenChange={(open) => !open && setScheduleTarget(null)}
        title="Đưa vào lịch tuần"
        description={scheduleTarget?.step.title}
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Ngày</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Giờ bắt đầu</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-ink-faint">Phút</label>
              <input
                type="number"
                min={5}
                step={5}
                value={scheduleDuration}
                onChange={(e) => setScheduleDuration(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          {scheduleError && <p className="text-xs text-danger">{scheduleError}</p>}
          <button
            type="button"
            onClick={handleConfirmSchedule}
            disabled={scheduleSaving}
            className="h-9 cursor-pointer rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scheduleSaving ? "Đang thêm..." : "Thêm vào lịch tuần"}
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}

function QuadrantSelect({
  goal,
  quadrant,
  onChange,
}: {
  goal: { important: boolean; controllable: boolean };
  quadrant: (typeof QUADRANTS)[number];
  onChange: (next: { important: boolean; controllable: boolean }) => void;
}) {
  const currentKey = `${goal.important}-${goal.controllable}`;
  return (
    <select
      value={currentKey}
      onChange={(e) => {
        const found = QUADRANTS.find((q) => `${q.important}-${q.controllable}` === e.target.value);
        if (found) onChange({ important: found.important, controllable: found.controllable });
      }}
      title="Chuyển sang nhóm ưu tiên khác"
      className={`h-6 cursor-pointer rounded-full border-0 px-2 text-[11px] font-semibold outline-none ${quadrant.badge}`}
    >
      {QUADRANTS.map((q) => (
        <option key={`${q.important}-${q.controllable}`} value={`${q.important}-${q.controllable}`}>
          {q.shortLabel}
        </option>
      ))}
    </select>
  );
}

function StepList({
  steps,
  onToggle,
  onDelete,
}: {
  steps: ApiTrackingGoalStep[];
  onToggle: (stepId: string, done: boolean) => void;
  onDelete: (stepId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {steps.map((step) => (
        <div
          key={step.id}
          className="group/step -mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-surface-muted/60"
        >
          <input
            type="checkbox"
            checked={step.done}
            onChange={(e) => onToggle(step.id, e.target.checked)}
            className="size-4 cursor-pointer accent-indigo-600"
          />
          <span className={step.done ? "flex-1 text-ink-faint line-through" : "flex-1 text-ink"}>
            {step.title}
          </span>
          {step.dueDate && <span className="shrink-0 text-[11px] text-ink-faint">{step.dueDate}</span>}
          {step.estimatedMinutes != null && (
            <span className="shrink-0 text-[11px] text-ink-faint">{step.estimatedMinutes}p</span>
          )}
          <button
            type="button"
            onClick={() => onDelete(step.id)}
            className="cursor-pointer text-ink-faint opacity-0 hover:text-danger group-hover/step:opacity-100"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function MilestoneBlock({
  milestone,
  stepDraftTitle,
  stepDraftMinutes,
  stepDraftDueDate,
  onStepTitleChange,
  onStepMinutesChange,
  onStepDueDateChange,
  onAddStep,
  onToggleStep,
  onDeleteStep,
  onDeleteMilestone,
  onSaveWeeklyNote,
  registerStepInputRef,
}: {
  milestone: ApiTrackingMilestone;
  stepDraftTitle: string;
  stepDraftMinutes: string;
  stepDraftDueDate: string;
  onStepTitleChange: (v: string) => void;
  onStepMinutesChange: (v: string) => void;
  onStepDueDateChange: (v: string) => void;
  onAddStep: () => void;
  onToggleStep: (stepId: string, done: boolean) => void;
  onDeleteStep: (stepId: string) => void;
  onDeleteMilestone: () => void;
  onSaveWeeklyNote: (note: string) => void;
  registerStepInputRef: (el: HTMLInputElement | null) => void;
}) {
  const doneCount = milestone.steps.filter((s) => s.done).length;
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(milestone.weeklyGoalNote ?? "");

  function commitNote() {
    setEditingNote(false);
    if (noteDraft.trim() !== (milestone.weeklyGoalNote ?? "")) {
      onSaveWeeklyNote(noteDraft.trim());
    }
  }

  return (
    <div className="group/milestone rounded-xl border border-border/60 bg-surface-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Flag size={13} className="text-indigo-500" />
          {milestone.title}
          {milestone.steps.length > 0 && (
            <span className="text-xs font-normal text-ink-faint">
              ({doneCount}/{milestone.steps.length})
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onDeleteMilestone}
          className="cursor-pointer rounded-md p-1 text-ink-faint opacity-0 hover:text-danger group-hover/milestone:opacity-100"
          aria-label="Xoá mốc"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="mt-1.5 rounded-lg bg-surface/70 px-2 py-1.5">
        <p className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">Tuần này</p>
        {editingNote ? (
          <input
            autoFocus
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={commitNote}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitNote();
            }}
            placeholder="Mục tiêu tuần này, vd: Xuất bản 2 bài"
            className="mt-0.5 h-6 w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNoteDraft(milestone.weeklyGoalNote ?? "");
              setEditingNote(true);
            }}
            className="mt-0.5 block w-full cursor-pointer truncate text-left text-xs text-ink-muted hover:text-ink"
          >
            {milestone.weeklyGoalNote || "+ Đặt mục tiêu tuần này..."}
          </button>
        )}
        {milestone.weeklyProgress ? (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{
                  width: `${
                    milestone.weeklyProgress.total > 0
                      ? (milestone.weeklyProgress.done / milestone.weeklyProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="shrink-0 text-[11px] text-ink-faint">
              {milestone.weeklyProgress.done}/{milestone.weeklyProgress.total}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-[11px] text-ink-faint">
            Đặt hạn cho bước trong tuần này để theo dõi tiến độ tuần.
          </p>
        )}
      </div>

      <div className="mt-1.5">
        <StepList steps={milestone.steps} onToggle={onToggleStep} onDelete={onDeleteStep} />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <input
          ref={registerStepInputRef}
          value={stepDraftTitle}
          onChange={(e) => onStepTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddStep();
          }}
          placeholder="+ thêm hành động..."
          className="h-7 min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint"
        />
        <input
          type="date"
          value={stepDraftDueDate}
          onChange={(e) => onStepDueDateChange(e.target.value)}
          className="h-7 w-32 shrink-0 rounded-md border border-border bg-transparent px-1.5 text-[11px] text-ink outline-none"
        />
        <input
          type="number"
          min={1}
          value={stepDraftMinutes}
          onChange={(e) => onStepMinutesChange(e.target.value)}
          placeholder="phút"
          className="h-7 w-16 shrink-0 rounded-md border border-border bg-transparent px-1.5 text-xs text-ink outline-none"
        />
      </div>
    </div>
  );
}
