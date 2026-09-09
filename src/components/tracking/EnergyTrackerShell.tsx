"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Moon, Sun, Utensils, Wind } from "lucide-react";
import type { ApiTrackingBestHour, ApiTrackingEnergyCheckin, ApiTrackingWellnessLog } from "@/lib/api/tracking";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import { createTrackingEnergyCheckinAction } from "@/actions/tracking/energy";

const AXES: { key: "physical" | "emotional" | "mental"; label: string; color: string }[] = [
  { key: "physical", label: "Thể chất", color: "#f97316" },
  { key: "emotional", label: "Cảm xúc", color: "#ec4899" },
  { key: "mental", label: "Tinh thần", color: "#6366f1" },
];

// Energy Tracker - "5 giay": 3 nhom nut tron 1-5, bam la LUU NGAY (khong can
// nut "Xac nhan" rieng, dung tinh than check-in sieu nhanh). Bieu do duong
// recharts hien 7 ngay gan nhat, moi checkin la 1 diem (khong gop trung
// binh theo ngay - de dung du lieu that, co the co nhieu checkin/ngay).
export function EnergyTrackerShell({
  initialCheckins,
  bestHour,
  wellnessToday,
}: {
  initialCheckins: ApiTrackingEnergyCheckin[];
  bestHour: ApiTrackingBestHour;
  wellnessToday: ApiTrackingWellnessLog | null;
}) {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function handlePick(axis: "physical" | "emotional" | "mental", value: number) {
    const next = { ...pending, [axis]: value };
    setPending(next);
    if (next.physical && next.emotional && next.mental) {
      setIsSaving(true);
      try {
        const created = await createTrackingEnergyCheckinAction({
          physical: next.physical,
          emotional: next.emotional,
          mental: next.mental,
        });
        setCheckins((c) => [...c, created]);
        setPending({});
        setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      } finally {
        setIsSaving(false);
      }
    }
  }

  const latest = checkins[checkins.length - 1] ?? null;

  const chartData = checkins.map((c) => ({
    time: new Date(c.checkedAt).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    physical: c.physical,
    emotional: c.emotional,
    mental: c.mental,
  }));

  return (
    <div className="flex flex-col gap-5">
      <TrackingPageHeader
        title="Năng lượng"
        description="Theo dõi chủ động 3 trụ cột năng lượng — thể chất, cảm xúc, tinh thần — để dùng năng lượng hiệu quả nhất. Biết được nhịp năng lượng của bản thân giúp xếp việc cần sáng tạo/tư duy nặng vào lúc năng lượng cao, và việc nhẹ vào lúc năng lượng thấp."
      />
      {latest && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-ink">Năng lượng hiện tại</p>
          <div className="flex flex-wrap gap-6">
            {AXES.map((axis) => (
              <EnergyGauge key={axis.key} value={latest[axis.key]} color={axis.color} label={axis.label} />
            ))}
          </div>
        </div>
      )}

      {bestHour && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <Sun size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">Gợi ý cho bạn: </span>
            Năng lượng tinh thần của bạn thường cao nhất vào khoảng{" "}
            <span className="font-semibold text-ink">{bestHour.hour}:00</span>. Hãy ưu tiên viết
            lách, học hoặc giải quyết vấn đề khó trong khung giờ này.
          </p>
        </div>
      )}

      {wellnessToday && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Sức khoẻ hôm nay</p>
            <Link href="/tracking/wellness" className="text-xs text-primary hover:underline">
              Xem chi tiết →
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Moon size={14} className="text-indigo-400" />
              {wellnessToday.sleepHours != null ? `${wellnessToday.sleepHours}h ngủ` : "Chưa ghi ngủ"}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Utensils size={14} className="text-emerald-500" />
              {wellnessToday.mealsLogged}/4 bữa
            </div>
            <div className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Wind size={14} className="text-sky-500" />
              {wellnessToday.exerciseMinutes != null
                ? `${wellnessToday.exerciseMinutes} phút vận động`
                : "Chưa ghi vận động"}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-ink">
          Bạn đang cảm thấy thế nào? {isSaving && <span className="text-ink-faint">(đang lưu...)</span>}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {AXES.map((axis) => (
            <div key={axis.key}>
              <p className="mb-1.5 text-xs font-medium text-ink-faint">{axis.label}</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handlePick(axis.key, v)}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition"
                    style={
                      pending[axis.key] === v
                        ? { background: axis.color, borderColor: axis.color, color: "white" }
                        : { borderColor: "var(--border)", color: "var(--ink-muted)" }
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {savedAt && <p className="mt-3 text-xs text-ink-faint">Đã lưu lúc {savedAt}</p>}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-ink">Nhịp năng lượng gần đây</p>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">
            Chưa có check-in nào — chấm 3 con số ở trên để bắt đầu.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--ink-faint)" }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "var(--ink-faint)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                {AXES.map((axis) => (
                  <Line
                    key={axis.key}
                    type="monotone"
                    dataKey={axis.key}
                    name={axis.label}
                    stroke={axis.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// Vong gauge nho (SVG thuan, khong can recharts) - hien 1 gia tri 1-5 cho
// checkin GAN NHAT, dung cung mau voi AXES de nhat quan voi bieu do duong
// ben duoi.
function EnergyGauge({ value, color, label }: { value: number; color: string; label: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 5) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-16">
        <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
          <circle cx={32} cy={32} r={radius} fill="none" stroke="var(--border)" strokeWidth={6} />
          <circle
            cx={32}
            cy={32}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink">
          {value}/5
        </span>
      </div>
      <p className="text-xs text-ink-faint">{label}</p>
    </div>
  );
}
