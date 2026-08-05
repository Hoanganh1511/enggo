"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Clock,
  Check,
  X,
  ArrowRight,
  Trophy,
  BadgeCheck,
  Inbox,
} from "lucide-react";

import type { Series, SeriesJoinRequest } from "@/content/series-mock";
import {
  SERIES_DIFFICULTY_META,
  SERIES_TASK_ICON,
} from "@/lib/discover/series-meta";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { SeriesRewardRow } from "./SeriesRewardRow";
import { SeriesJoinButton } from "./SeriesJoinButton";

// Client component vi toan bo tuong tac cua trang deu la state cuc bo: tick
// viec, xin tham gia (modal) va duyet/tu choi don. Dot nay CHUA co backend
// nen khong luu gi - xem comment dau series-mock.ts.
export default function SeriesDetailContainer({ series }: { series: Series }) {
  const [doneTaskIds, setDoneTaskIds] = useState<Set<string>>(
    () => new Set(series.todayTasks.filter((t) => t.done).map((t) => t.id)),
  );
  // Chi co y nghia khi series.isOwner - duyet/tu choi deu chi go don khoi
  // danh sach dang cho (chua co noi de luu ket qua).
  const [requests, setRequests] = useState<SeriesJoinRequest[]>(
    series.joinRequests,
  );

  const difficulty = SERIES_DIFFICULTY_META[series.difficulty];
  const daysLeft = Math.max(0, series.estimatedDurationDays - series.currentDay);

  const toggleTask = (id: string) =>
    setDoneTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const resolveRequest = (id: string) =>
    setRequests((prev) => prev.filter((r) => r.id !== id));

  // Chi thanh vien da duoc nhan (hoac chu series) moi thay phan viec hang
  // ngay - nguoi ngoai/dang cho duyet chi thay gioi thieu + bang xep hang.
  const canSeeTasks = series.isOwner || series.joinStatus === "approved";

  return (
    // max-w-4xl cho de doc. Tu them px-4 pt-4 - trang nay khong con nam
    // trong HomeLayoutShell (da chuyen /series ra khoi (main)/(feed), khong
    // con sidebar), phai tu lo padding.
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pt-4 pb-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="rounded-sm bg-surface-muted px-2 py-0.5 text-ink-muted">
            {series.type}
          </span>
          <span
            className={cn("inline-flex items-center gap-1", difficulty.textClass)}
          >
            <span className={cn("size-1.5 rounded-full", difficulty.dotClass)} />
            {difficulty.label}
          </span>
          <span className="inline-flex items-center gap-1 text-ink-faint">
            <Clock size={11} strokeWidth={2} />
            {series.estimatedDurationDays} ngày
          </span>
          <span className="inline-flex items-center gap-1 text-ink-faint">
            <Users size={11} strokeWidth={2} />
            {series.memberCount.toLocaleString("vi-VN")} thành viên
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-ink">
            {series.title}
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            {series.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Link
            href={`/u/${series.author.username}`}
            className="flex min-w-0 items-center gap-1.5"
          >
            <Image
              src={series.author.avatarUrl}
              alt={series.author.name}
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="truncate font-medium text-ink">
              {series.author.name}
            </span>
            {series.author.verified && (
              <BadgeCheck
                size={13}
                strokeWidth={2.25}
                className="shrink-0 text-primary"
              />
            )}
          </Link>
          <span className="text-ink-faint">
            {series.isOwner ? "· series của bạn" : "· người tạo series"}
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
          <ProgressBar percent={series.progressPercent} className="h-2" />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <span>
              Ngày{" "}
              <span className="font-semibold text-ink">{series.currentDay}</span>{" "}
              / {series.estimatedDurationDays} · còn khoảng {daysLeft} ngày
            </span>
            <SeriesRewardRow reward={series.reward} />
          </div>
        </div>

        <SeriesJoinButton series={series} className="h-9 w-full sm:w-48" />
      </header>

      {/* Khu duyet don - CHI chu series thay. Day la diem cot loi cua mo hinh
          moi: series do nguoi dung tao, nguoi tao la nguoi quyet dinh nhan ai
          vao dua tren phan trinh bay ho viet trong modal xin tham gia. */}
      {series.isOwner && (
        <section className="flex flex-col gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            <Inbox size={16} strokeWidth={2} className="text-primary" />
            Đơn xin tham gia
            {requests.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white">
                {requests.length}
              </span>
            )}
          </h2>

          {requests.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-sm text-ink-faint">
              Chưa có đơn nào đang chờ duyệt.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={r.avatarUrl}
                      alt={r.name}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-ink">
                        {r.name}
                      </span>
                      <span className="truncate text-[11px] text-ink-faint">
                        @{r.username} · {formatRelativeTime(r.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-sm leading-relaxed">
                    <div>
                      <p className="text-[11px] font-medium text-ink-faint uppercase">
                        Lý do tham gia
                      </p>
                      <p className="text-ink-muted">{r.reason}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-ink-faint uppercase">
                        Giới thiệu
                      </p>
                      <p className="text-ink-muted">{r.intro}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => resolveRequest(r.id)}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-3 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
                    >
                      <X size={13} strokeWidth={2} />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveRequest(r.id)}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm bg-primary px-3 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      Nhận vào
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {canSeeTasks && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Việc cần làm hôm nay
          </h2>
          {/* Moi viec tro thang toi 1 view content type CO SAN cua app - day
              la phan the hien "series chi dieu phoi cac entity da co", khong
              tao ra loai noi dung moi. */}
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {series.todayTasks.map((task) => {
              const Icon = SERIES_TASK_ICON[task.targetKind];
              const done = doneTaskIds.has(task.id);
              return (
                <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-pressed={done}
                    className={cn(
                      "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors duration-150 ease-out",
                      done
                        ? "border-primary bg-primary text-white"
                        : "border-border text-transparent hover:border-hover-border",
                    )}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>
                  <Icon
                    size={15}
                    strokeWidth={1.75}
                    className="shrink-0 text-ink-faint"
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm",
                      done ? "text-ink-faint line-through" : "text-ink",
                    )}
                  >
                    {task.label}
                  </span>
                  <Link
                    href={task.href}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Đi tới
                    <ArrowRight size={12} strokeWidth={2} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
          <Trophy size={16} strokeWidth={2} className="text-warning" />
          Bảng xếp hạng
        </h2>
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {series.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-ink-faint">
                {m.rank}
              </span>
              <Image
                src={m.avatarUrl}
                alt={m.name}
                width={28}
                height={28}
                className="size-7 shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {m.name}
              </span>
              <ProgressBar
                percent={m.progressPercent}
                className="hidden w-32 shrink-0 sm:block"
              />
              <span className="w-9 shrink-0 text-right text-xs text-ink-muted">
                {m.progressPercent}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
