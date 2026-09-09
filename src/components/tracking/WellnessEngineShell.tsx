"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sparkles, Timer, Utensils, Wind } from "lucide-react";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type { ApiTrackingSleepInsight, ApiTrackingWellnessLog } from "@/lib/api/tracking";
import { upsertTrackingWellnessLogAction } from "@/actions/tracking/wellness";

const NAP_OPTIONS = [15, 20, 25];

// Wellness Engine - MVP: 1 form log/ngay (upsert that) + Nap Timer THUAN
// CLIENT (khong background khi dong tab - xem plan). Dung Notification API
// trinh duyet neu duoc cap quyen, khong thi chi doi mau banner khi het gio.
export function WellnessEngineShell({
  initialDate,
  initialLog,
  initialSleepInsight,
}: {
  initialDate: string;
  initialLog: ApiTrackingWellnessLog | null;
  initialSleepInsight: ApiTrackingSleepInsight;
}) {
  const [sleepHours, setSleepHours] = useState(initialLog?.sleepHours?.toString() ?? "");
  const [sleepQuality, setSleepQuality] = useState(initialLog?.sleepQuality ?? null);
  const [exerciseMinutes, setExerciseMinutes] = useState(
    initialLog?.exerciseMinutes?.toString() ?? "",
  );
  const [mealsLogged, setMealsLogged] = useState(initialLog?.mealsLogged ?? 0);
  const [notes, setNotes] = useState(initialLog?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [napSeconds, setNapSeconds] = useState<number | null>(null);
  const [napDone, setNapDone] = useState(false);
  const napIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (napIntervalRef.current) clearInterval(napIntervalRef.current);
    };
  }, []);

  function startNap(minutes: number) {
    setNapDone(false);
    setNapSeconds(minutes * 60);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    if (napIntervalRef.current) clearInterval(napIntervalRef.current);
    napIntervalRef.current = setInterval(() => {
      setNapSeconds((s) => {
        if (s === null) return null;
        if (s <= 1) {
          if (napIntervalRef.current) clearInterval(napIntervalRef.current);
          setNapDone(true);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("Hết giờ chợp mắt", { body: "Dậy thôi, quay lại làm việc nhé!" });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }
  function cancelNap() {
    if (napIntervalRef.current) clearInterval(napIntervalRef.current);
    setNapSeconds(null);
    setNapDone(false);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await upsertTrackingWellnessLogAction(initialDate, {
        sleepHours: sleepHours ? Number(sleepHours) : undefined,
        sleepQuality: sleepQuality ?? undefined,
        exerciseMinutes: exerciseMinutes ? Number(exerciseMinutes) : undefined,
        mealsLogged,
        notes: notes.trim() || undefined,
      });
      setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TrackingPageHeader
        title="Sức khoẻ"
        description="Nền tảng thể chất cho năng lượng bền vững: ăn nhẹ nhiều bữa để giữ đường huyết ổn định, tối ưu chất lượng lẫn số lượng giấc ngủ (kể cả chợp mắt ngắn), và vận động ngắt quãng — giãn cơ sau mỗi 30 phút, đi lại sau mỗi 90 phút — để duy trì sự tập trung."
      />
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3">
          <Moon size={16} className="shrink-0 text-indigo-400" />
          <div>
            <p className="font-content text-base font-bold text-ink">
              {initialLog?.sleepHours != null ? `${initialLog.sleepHours}h` : "—"}
            </p>
            <p className="text-[11px] text-ink-faint">Ngủ</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3">
          <Utensils size={16} className="shrink-0 text-emerald-500" />
          <div>
            <p className="font-content text-base font-bold text-ink">
              {initialLog?.mealsLogged ?? 0}/4
            </p>
            <p className="text-[11px] text-ink-faint">Bữa ăn</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3">
          <Wind size={16} className="shrink-0 text-sky-500" />
          <div>
            <p className="font-content text-base font-bold text-ink">
              {initialLog?.exerciseMinutes != null ? `${initialLog.exerciseMinutes}p` : "—"}
            </p>
            <p className="text-[11px] text-ink-faint">Vận động</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Moon size={15} /> Nhật ký {initialDate}
          </p>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Số giờ ngủ</label>
            <input
              type="number"
              step={0.5}
              min={0}
              max={24}
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="h-9 w-32 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Chất lượng giấc ngủ</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSleepQuality(v)}
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition ${
                    sleepQuality === v
                      ? "border-primary bg-primary text-surface"
                      : "border-border text-ink-muted hover:bg-hover-bg"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Phút vận động</label>
            <input
              type="number"
              min={0}
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(e.target.value)}
              className="h-9 w-32 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Số bữa đã ăn hôm nay</label>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMealsLogged(v)}
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition ${
                    mealsLogged === v
                      ? "border-primary bg-primary text-surface"
                      : "border-border text-ink-muted hover:bg-hover-bg"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Lưu nhật ký"}
            </button>
            {savedAt && <span className="text-xs text-ink-faint">Đã lưu lúc {savedAt}</span>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Timer size={15} /> Chợp mắt ngắn
        </p>
        {napSeconds === null ? (
          <div className="flex gap-1.5">
            {NAP_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => startNap(m)}
                className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-ink-muted hover:bg-hover-bg"
              >
                {m} phút
              </button>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-lg p-4 text-center ${napDone ? "bg-primary/10" : "bg-surface-muted"}`}
          >
            <p className="text-2xl font-bold text-ink">
              {Math.floor(napSeconds / 60)}:{(napSeconds % 60).toString().padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {napDone ? "Hết giờ! Dậy thôi." : "Đang đếm ngược..."}
            </p>
            <button
              type="button"
              onClick={cancelNap}
              className="mt-3 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted hover:bg-hover-bg"
            >
              {napDone ? "Đóng" : "Huỷ"}
            </button>
          </div>
        )}
        <p className="mt-3 text-[11px] text-ink-faint">
          Bộ đếm chỉ chạy khi tab đang mở — sắp có thông báo nền khi đóng tab.
        </p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Sparkles size={14} className="text-indigo-500" /> Ngủ đủ giấc có giúp hoàn thành việc
            tốt hơn không?
          </p>
          {initialSleepInsight.withGoodSleep != null && initialSleepInsight.withoutGoodSleep != null ? (
            <div className="flex items-center gap-4">
              <div>
                <p className="font-content text-xl font-bold text-ink">
                  {initialSleepInsight.withGoodSleep}%
                </p>
                <p className="text-[11px] text-ink-faint">Ngày ngủ ≥7h</p>
              </div>
              <div>
                <p className="font-content text-xl font-bold text-ink-muted">
                  {initialSleepInsight.withoutGoodSleep}%
                </p>
                <p className="text-[11px] text-ink-faint">Ngày ngủ &lt;7h</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-faint">
              Cần thêm dữ liệu — tiếp tục ghi nhật ký sức khoẻ và hoàn thành việc ở trang Hôm nay
              để insight này xuất hiện.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
