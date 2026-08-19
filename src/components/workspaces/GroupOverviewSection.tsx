"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Flame,
  Layers,
  Map as MapIcon,
  Settings,
  Sparkles,
} from "lucide-react";
import type { ApiDocumentSummary, ApiGroupProgress, ApiKnowledgeGroup } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { getGroupProgressAction } from "@/actions/knowledge-groups/get-group-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { sidebarFadeUp, sidebarStagger, SidebarMetric } from "./article-tab-shared";
import { GroupIconGlyph } from "./group-icons";
import { GroupCertSettingsModal } from "./GroupCertSettingsModal";
import { useWorkspaceShell } from "./workspace-shell-context";

// "Trang" Tong quan - mac dinh khi vao 1 nhom (xem WorkspaceShell.tsx). Gop
// GroupProgressWidget.tsx (cert/progress/4 chi so, truoc day chi la 1 widget
// nho trong tab "Tổng quan" cua bai viet) len thanh header full-width, them
// "Tiếp tục học" (bai cap nhat gan nhat) + "Kiến thức gần đây" (cac series
// gan day). KHONG hien trang thai ✓/◐/○ cho tung "kien thuc" - can aggregate
// checklist THEO SERIES o backend, chua co (chi co o cap CA nhom qua
// getGroupProgress), them 1 status GIA se vi pham nguyen tac "không tạo fake
// functionality" - de lai cho trang Kien thuc that (phase sau).
export function GroupOverviewSection({
  group,
  docs,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
}) {
  const { isSelf, username, workspace, setActiveSection } = useWorkspaceShell();
  const [progress, setProgress] = useState<ApiGroupProgress | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGroupProgressAction(group.id)
      .then((res) => {
        if (!cancelled) setProgress(res);
      })
      .catch(() => {
        if (!cancelled) setProgress(null);
      });
    return () => {
      cancelled = true;
    };
  }, [group.id]);

  // "Tiep tuc hoc" - bai CAP NHAT gan nhat (khong phai auto-dieu-huong nhu
  // ban truoc, chi la 1 the goi y + link that su).
  const continueDoc = useMemo(() => {
    if (docs.length === 0) return null;
    return [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  }, [docs]);

  // Series gan day - nhom docs theo series, sap theo lan cap nhat MOI NHAT
  // cua bai THUOC series do.
  const recentSeries = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; lastUpdated: string }>();
    for (const d of docs) {
      if (!d.series) continue;
      const existing = map.get(d.series.id);
      if (existing) {
        existing.count += 1;
        if (d.updatedAt > existing.lastUpdated) existing.lastUpdated = d.updatedAt;
      } else {
        map.set(d.series.id, {
          id: d.series.id,
          name: d.series.name,
          count: 1,
          lastUpdated: d.updatedAt,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);
  }, [docs]);

  const publicCount = docs.length; // group.postCount da tinh san nhung docs o day la ban da fetch, dung truc tiep cho on dinh

  return (
    <motion.div
      variants={sidebarStagger}
      initial="hidden"
      animate="show"
      className="h-full overflow-y-auto px-6 py-5"
    >
      {/* Header: icon + ten nhom + muc tieu chung chi + progress + 4 chi so -
          gop tu GroupProgressWidget.tsx, phong to thanh header trang. */}
      <motion.div
        variants={sidebarFadeUp}
        className="rounded-[13px] p-4"
        style={{
          border: "1px solid var(--border)",
          background: "linear-gradient(135deg, var(--surface-raised), var(--surface))",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--active-bg)", color: "var(--primary)" }}
          >
            <GroupIconGlyph name={group.icon} size={20} strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-bold" style={{ color: "var(--ink)" }}>
              {group.name}
            </h1>
            {group.certName ? (
              <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--ink-faint)" }}>
                Chứng chỉ mục tiêu: {group.certName}
                {group.certCode ? ` · ${group.certCode}` : ""}
              </p>
            ) : (
              isSelf && (
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="mt-0.5 flex cursor-pointer items-center gap-1 text-[11px] font-medium transition-colors duration-150 ease-out hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  <Settings size={11} strokeWidth={2} />
                  Thiết lập mục tiêu chứng chỉ
                </button>
              )
            )}
          </div>
          {isSelf && group.certName && (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Sửa mục tiêu chứng chỉ"
              aria-label="Sửa mục tiêu chứng chỉ"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              <Settings size={14} strokeWidth={1.9} />
            </button>
          )}
        </div>

        {group.certName && (
          <div className="mt-4 flex items-center gap-2">
            <ProgressBar percent={progress?.progressPercent ?? 0} className="flex-1" />
            <span className="shrink-0 text-[12px] font-semibold" style={{ color: "var(--ink-muted)" }}>
              {progress ? `${progress.progressPercent}%` : "…"}
            </span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-4 gap-2">
          <SidebarMetric
            icon={<CalendarDays size={12} strokeWidth={1.9} />}
            label="Ngày học"
            value={progress ? String(progress.totalStudyDays) : "…"}
          />
          <SidebarMetric
            icon={<FileText size={12} strokeWidth={1.9} />}
            label="Bài viết"
            value={String(publicCount)}
          />
          <SidebarMetric
            icon={<Layers size={12} strokeWidth={1.9} />}
            label="Chủ đề"
            value={progress ? String(progress.topicCount) : "…"}
          />
          <SidebarMetric
            icon={<Flame size={12} strokeWidth={1.9} />}
            label="Streak"
            value={progress ? `${progress.currentStreak} ngày` : "…"}
          />
        </div>

        <GroupCertSettingsModal group={group} open={settingsOpen} onOpenChange={setSettingsOpen} />
      </motion.div>

      {/* Tiep tuc hoc */}
      {continueDoc && (
        <motion.div variants={sidebarFadeUp} className="mt-4">
          <Link
            href={`/workspace/${username}/${workspace.id}/${continueDoc.slug}`}
            className="group flex items-center gap-3 rounded-[13px] p-4 transition-colors duration-150 ease-out"
            style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--active-bg)", color: "var(--primary)" }}
            >
              <MapIcon size={16} strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold tracking-wide" style={{ color: "var(--ink-faint)" }}>
                TIẾP TỤC HỌC
              </p>
              <p className="mt-0.5 truncate text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                {continueDoc.title}
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                {continueDoc.series?.name ? `${continueDoc.series.name} · ` : ""}
                Cập nhật {formatRelativeTime(continueDoc.updatedAt)}
              </p>
            </div>
            <ArrowRight
              size={16}
              strokeWidth={2}
              className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              style={{ color: "var(--ink-faint)" }}
            />
          </Link>
        </motion.div>
      )}

      {/* Kien thuc gan day */}
      {recentSeries.length > 0 ? (
        <motion.div variants={sidebarFadeUp} className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[12px] font-bold tracking-wide" style={{ color: "var(--ink-faint)" }}>
              KIẾN THỨC GẦN ĐÂY
            </h2>
            <button
              type="button"
              onClick={() => setActiveSection("articles")}
              className="cursor-pointer text-[11px] font-medium"
              style={{ color: "var(--primary)" }}
            >
              Xem tất cả
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {recentSeries.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection("articles")}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] p-2.5 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
              >
                <Layers size={14} strokeWidth={1.9} className="shrink-0" style={{ color: "var(--ink-faint)" }} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium" style={{ color: "var(--ink)" }}>
                  {s.name}
                </span>
                <span className="shrink-0 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                  {s.count} bài · {formatRelativeTime(s.lastUpdated)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        docs.length === 0 && (
          <motion.div
            variants={sidebarFadeUp}
            className="mt-6 flex flex-col items-center gap-2 py-8 text-center"
          >
            <Sparkles size={22} strokeWidth={1.5} style={{ color: "var(--ink-faint)" }} />
            <p className="text-[12.5px]" style={{ color: "var(--ink-faint)" }}>
              Nhóm này chưa có bài viết nào - bắt đầu viết để thấy tiến độ ở đây.
            </p>
          </motion.div>
        )
      )}
    </motion.div>
  );
}
