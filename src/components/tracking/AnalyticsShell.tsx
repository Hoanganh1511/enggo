"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Moon, Sparkles, Sun } from "lucide-react";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type {
  ApiTrackingBestHour,
  ApiTrackingRecommendation,
  ApiTrackingSleepInsight,
  ApiTrackingWeeklySummary,
} from "@/lib/api/tracking";
import {
  getTrackingCoachSuggestionsAction,
  applyTrackingBestHourAction,
} from "@/actions/tracking/analytics";

function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, "0")}`;
}

const ANALYTICS_DESCRIPTION =
  "Tổng hợp số liệu tuần (hoàn thành công việc, năng lượng, giấc ngủ, buổi làm việc nhóm) thành báo cáo dễ hiểu, và nhận gợi ý AI Coaching cá nhân hoá — 2-3 đề xuất cụ thể dựa trên chính dữ liệu thực của bạn.";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-content mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

// Analytics - so lieu 7 ngay that (khong bia) + 1 nut goi that
// tracking/assistant/coach (Claude that, xem tracking-assistant.service.ts
// backend) - KHONG tu dong goi luc vao trang (chi phi/ do tre), nguoi dung
// tu bam khi muon.
export function AnalyticsShell({
  initialSummary,
  initialRecommendation,
  bestHour,
  sleepInsight,
}: {
  initialSummary: ApiTrackingWeeklySummary | null;
  initialRecommendation: ApiTrackingRecommendation;
  bestHour: ApiTrackingBestHour;
  sleepInsight: ApiTrackingSleepInsight | null;
}) {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  async function handleApplyBestHour() {
    setIsApplying(true);
    try {
      const updated = await applyTrackingBestHourAction();
      setAppliedCount(updated.length);
      setRecommendation(null);
    } catch {
      setAppliedCount(null);
    } finally {
      setIsApplying(false);
    }
  }

  async function handleCoach() {
    setIsCoaching(true);
    setCoachError(null);
    try {
      const { suggestions: text } = await getTrackingCoachSuggestionsAction();
      setSuggestions(text);
    } catch {
      setCoachError("AI không phản hồi được, thử lại sau.");
    } finally {
      setIsCoaching(false);
    }
  }

  if (!initialSummary) {
    return (
      <div className="flex flex-col gap-4">
        <TrackingPageHeader title="Phân tích" description={ANALYTICS_DESCRIPTION} />
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-faint">
          Chưa tải được số liệu, thử lại sau.
        </p>
      </div>
    );
  }

  const completionData = [
    {
      name: `${initialSummary.from} → ${initialSummary.to}`,
      "Đã xong": initialSummary.tasksDone,
      "Còn lại": initialSummary.tasksTotal - initialSummary.tasksDone,
    },
  ];
  const energyData = initialSummary.avgEnergy
    ? [
        { name: "Thể chất", value: initialSummary.avgEnergy.physical },
        { name: "Cảm xúc", value: initialSummary.avgEnergy.emotional },
        { name: "Tinh thần", value: initialSummary.avgEnergy.mental },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <TrackingPageHeader title="Phân tích" description={ANALYTICS_DESCRIPTION} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Tỷ lệ hoàn thành task"
          value={
            initialSummary.taskCompletionRate != null
              ? `${Math.round(initialSummary.taskCompletionRate * 100)}%`
              : "—"
          }
        />
        <StatTile
          label="Năng lượng TB"
          value={
            initialSummary.avgEnergy
              ? (
                  (initialSummary.avgEnergy.physical +
                    initialSummary.avgEnergy.emotional +
                    initialSummary.avgEnergy.mental) /
                  3
                ).toFixed(1)
              : "—"
          }
        />
        <StatTile
          label="Giờ ngủ TB"
          value={initialSummary.avgSleepHours != null ? `${initialSummary.avgSleepHours}h` : "—"}
        />
        <StatTile label="Buổi làm việc nhóm" value={String(initialSummary.groupSessionCount)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-ink">Hoàn thành task (7 ngày)</p>
          {initialSummary.tasksTotal === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">Chưa có task nào trong 7 ngày qua.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Đã xong", value: initialSummary.tasksDone },
                        {
                          name: "Còn lại",
                          value: Math.max(0, initialSummary.tasksTotal - initialSummary.tasksDone),
                        },
                      ]}
                      dataKey="value"
                      innerRadius={28}
                      outerRadius={38}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <Cell fill="var(--primary)" />
                      <Cell fill="var(--surface-muted)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink">
                  {initialSummary.taskCompletionRate != null
                    ? `${Math.round(initialSummary.taskCompletionRate * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="h-40 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-faint)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--ink-faint)" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="Đã xong" stackId="a" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Còn lại" stackId="a" fill="var(--surface-muted)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-ink">Năng lượng trung bình theo trục</p>
          {energyData.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">Chưa có check-in năng lượng nào.</p>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-faint)" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "var(--ink-faint)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {(bestHour || sleepInsight?.withGoodSleep != null) && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Điều chúng tôi học được
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bestHour && (
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-4">
                <Sun size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-ink">Bạn tập trung tốt nhất lúc {bestHour.hour}:00</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    Dựa trên năng lượng tinh thần trung bình các lần chấm điểm.
                  </p>
                </div>
              </div>
            )}
            {sleepInsight?.withGoodSleep != null && sleepInsight.withoutGoodSleep != null && (
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-4">
                <Moon size={16} className="mt-0.5 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Ngủ đủ giấc giúp hoàn thành việc tốt hơn{" "}
                    {sleepInsight.withGoodSleep - sleepInsight.withoutGoodSleep > 0 ? "+" : ""}
                    {sleepInsight.withGoodSleep - sleepInsight.withoutGoodSleep}%
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {sleepInsight.withGoodSleep}% ngày hoàn thành việc khi ngủ ≥7h, so với{" "}
                    {sleepInsight.withoutGoodSleep}% khi ngủ ít hơn.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          Đề xuất dựa trên dữ liệu
        </p>
        {recommendation ? (
          <>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink">
              Có {recommendation.focusedBlocksToRealign} khối Tập trung cao tuần tới chưa đúng khung
              giờ năng lượng tốt nhất
              <span className="inline-flex items-center gap-1 font-semibold text-indigo-700">
                <ArrowRight size={13} /> {minutesToLabel(recommendation.bestHour * 60)}
              </span>
              . Chuyển tất cả sang khung giờ này?
            </p>
            <button
              type="button"
              onClick={handleApplyBestHour}
              disabled={isApplying}
              className="mt-3 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApplying ? "Đang áp dụng..." : "Xem & áp dụng"}
            </button>
          </>
        ) : appliedCount != null ? (
          <p className="mt-1.5 text-sm text-ink-muted">
            Đã chuyển {appliedCount} khối Tập trung cao sang khung giờ năng lượng tốt nhất.
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-ink-faint">
            Chưa đủ dữ liệu, hoặc lịch tuần tới đã khớp đúng nhịp năng lượng của bạn.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
        <button
          type="button"
          onClick={handleCoach}
          disabled={isCoaching}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={15} /> {isCoaching ? "Đang phân tích..." : "Xin gợi ý AI"}
        </button>
        {coachError && <p className="mt-2 text-xs text-danger">{coachError}</p>}
        {suggestions && (
          <p className="font-content mt-3 text-sm leading-6 whitespace-pre-wrap text-ink">
            {suggestions}
          </p>
        )}
      </div>
    </div>
  );
}
