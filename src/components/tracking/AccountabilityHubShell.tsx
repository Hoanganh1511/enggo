"use client";

import { useState } from "react";
import { Copy, Play, Square, Users } from "lucide-react";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type { ApiTrackingGroup, ApiTrackingGroupDetail } from "@/lib/api/tracking";
import {
  createTrackingGroupAction,
  joinTrackingGroupAction,
  getTrackingGroupAction,
  startTrackingGroupSessionAction,
  endTrackingGroupSessionAction,
} from "@/actions/tracking/accountability";

function last30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

// Accountability Hub - MVP: tao/tham gia nhom, bat dau/ket thuc phien (nhap
// muc tieu phien that), heatmap CSS grid 30 ngay gan nhat theo so phien HOAN
// THANH cua ca nhom. KHONG co real-time presence/nhan "nang luong tich cuc"
// (xem plan "Khong lam lan nay") - disabled trung thuc.
export function AccountabilityHubShell({ initialGroups }: { initialGroups: ApiTrackingGroup[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [detail, setDetail] = useState<ApiTrackingGroupDetail | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [sessionGoal, setSessionGoal] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openGroup(id: string) {
    const g = await getTrackingGroupAction(id).catch(() => null);
    setDetail(g);
    setActiveSessionId(null);
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    setError(null);
    try {
      const created = await createTrackingGroupAction(newGroupName.trim());
      setGroups((g) => [created, ...g]);
      setNewGroupName("");
    } catch {
      setError("Không tạo được nhóm, thử lại sau.");
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setError(null);
    try {
      const joined = await joinTrackingGroupAction(joinCode.trim());
      if (!groups.some((g) => g.id === joined.id)) setGroups((g) => [joined, ...g]);
      setJoinCode("");
      openGroup(joined.id);
    } catch {
      setError("Mã mời không hợp lệ hoặc có lỗi, thử lại.");
    }
  }

  async function handleStartSession() {
    if (!detail || !sessionGoal.trim()) return;
    const session = await startTrackingGroupSessionAction(detail.id, sessionGoal.trim()).catch(
      () => null,
    );
    if (session) {
      setActiveSessionId(session.id);
      setSessionGoal("");
      setDetail((d) => (d ? { ...d, recentSessions: [session, ...d.recentSessions] } : d));
    }
  }

  async function handleEndSession(completed: boolean) {
    if (!activeSessionId) return;
    const updated = await endTrackingGroupSessionAction(activeSessionId, completed).catch(
      () => null,
    );
    if (updated) {
      setDetail((d) =>
        d
          ? {
              ...d,
              recentSessions: d.recentSessions.map((s) => (s.id === updated.id ? updated : s)),
            }
          : d,
      );
      setActiveSessionId(null);
    }
  }

  const days = last30Days();
  const completedByDay = new Map<string, number>();
  detail?.recentSessions.forEach((s) => {
    if (!s.completed) return;
    const day = s.startedAt.slice(0, 10);
    completedByDay.set(day, (completedByDay.get(day) ?? 0) + 1);
  });

  return (
    <div className="flex flex-col gap-4">
      <TrackingPageHeader
        title="Nhóm"
        description="Tận dụng trách nhiệm xã hội để tăng động lực: tham gia nhóm cam kết, chia sẻ mục tiêu của phiên làm việc trước khi bắt đầu, giúp tăng tập trung, hiệu suất và xây dựng ý thức cộng đồng cùng nhau tiến bộ."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 text-xs font-semibold text-ink-faint uppercase">Nhóm của tôi</p>
          <div className="flex flex-col gap-1">
            {groups.length === 0 && (
              <p className="py-3 text-center text-xs text-ink-faint">Chưa tham gia nhóm nào.</p>
            )}
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => openGroup(g.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                  detail?.id === g.id ? "bg-hover-bg font-semibold text-ink" : "text-ink-muted hover:bg-hover-bg"
                }`}
              >
                <Users size={14} className="shrink-0" />
                <span className="flex-1 truncate">{g.name}</span>
                <span className="text-xs text-ink-faint">{g.memberCount}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 text-xs font-semibold text-ink-faint uppercase">Tạo nhóm mới</p>
          <div className="flex gap-1.5">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Tên nhóm"
              className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs text-ink outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={handleCreateGroup}
              className="cursor-pointer rounded-md bg-primary px-2.5 text-xs font-semibold text-surface hover:opacity-90"
            >
              Tạo
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 text-xs font-semibold text-ink-faint uppercase">Tham gia bằng mã mời</p>
          <div className="flex gap-1.5">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Dán mã mời"
              className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs text-ink outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={handleJoin}
              className="cursor-pointer rounded-md border border-border px-2.5 text-xs font-semibold text-ink-muted hover:bg-hover-bg"
            >
              Vào
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div>
        {!detail ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-faint">
            Chọn 1 nhóm hoặc tạo nhóm mới để bắt đầu.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-content text-lg font-bold text-ink">{detail.name}</h2>
                <span className="text-xs text-ink-faint">{detail.memberCount} thành viên</span>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(detail.inviteCode).catch(() => {})}
                className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs text-ink-faint hover:text-ink"
              >
                <Copy size={12} /> Mã mời: {detail.inviteCode}
              </button>

              <div className="mt-4 border-t border-border pt-4">
                {activeSessionId ? (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-ink">Đang trong 1 phiên làm việc...</span>
                    <button
                      type="button"
                      onClick={() => handleEndSession(true)}
                      className="flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-surface hover:opacity-90"
                    >
                      <Square size={12} /> Hoàn thành
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEndSession(false)}
                      className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted hover:bg-hover-bg"
                    >
                      Bỏ dở
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={sessionGoal}
                      onChange={(e) => setSessionGoal(e.target.value)}
                      placeholder="Mục tiêu cho phiên này..."
                      className="h-9 flex-1 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={handleStartSession}
                      disabled={!sessionGoal.trim()}
                      className="flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 text-sm font-semibold text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Play size={14} /> Bắt đầu phiên
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-3 text-sm font-semibold text-ink">30 ngày gần đây (phiên hoàn thành)</p>
              <div className="grid grid-cols-10 gap-1 sm:grid-cols-15">
                {days.map((d) => {
                  const count = completedByDay.get(d) ?? 0;
                  return (
                    <div
                      key={d}
                      title={`${d}: ${count} phiên`}
                      className="aspect-square rounded-sm"
                      style={{
                        background:
                          count === 0
                            ? "var(--surface-muted)"
                            : `color-mix(in srgb, var(--primary) ${Math.min(count * 30 + 20, 100)}%, var(--surface-muted))`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Phiên gần đây</p>
              <div className="flex flex-col gap-2">
                {detail.recentSessions.length === 0 ? (
                  <p className="text-sm text-ink-faint">Chưa có phiên nào.</p>
                ) : (
                  detail.recentSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-sm">
                      <span className="text-ink">{s.goalText}</span>
                      <span
                        className={`text-xs ${s.completed ? "text-primary" : "text-ink-faint"}`}
                      >
                        {s.completed ? "Hoàn thành" : s.endedAt ? "Bỏ dở" : "Đang diễn ra"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-xs text-ink-faint">
              Xem ai đang tập trung theo thời gian thực và gửi &ldquo;năng lượng tích cực&rdquo; — sắp có.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
