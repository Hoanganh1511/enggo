"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, FileText, Flame, Layers, Settings } from "lucide-react";
import type { ApiGroupProgress, ApiKnowledgeGroup } from "@/lib/api/types";
import { getGroupProgressAction } from "@/actions/knowledge-groups/get-group-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { sidebarFadeUp, SidebarMetric } from "./article-tab-shared";
import { GroupCertSettingsModal } from "./GroupCertSettingsModal";
import { useWorkspaceShell } from "./workspace-shell-context";

// Widget "muc tieu chung chi" cua NHOM kien thuc (khong phai cua rieng bai
// viet dang doc) - dat dau tab Tong quan (ArticleOverview.tsx). "Ngay hoc"/
// "chu de"/"streak" fetch rieng qua getGroupProgressAction (khong co san
// tren ApiKnowledgeGroup, can tinh o backend), "bai viet" dung thang
// group.postCount da co san.
export function GroupProgressWidget({ group }: { group: ApiKnowledgeGroup }) {
  const { isSelf } = useWorkspaceShell();
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

  // Chua thiet lap chung chi muc tieu - CHI chu workspace (isSelf) moi thay
  // 1 hang CTA nho de thiet lap, nguoi xem khac khong thay gi (tranh 1 khoi
  // trong vo nghia tren trang nguoi khac).
  if (!group.certName) {
    if (!isSelf) return null;
    return (
      <>
        <motion.button
          type="button"
          variants={sidebarFadeUp}
          onClick={() => setSettingsOpen(true)}
          className="mb-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border border-dashed border-border py-3 text-[11px] font-medium text-ink-faint transition-colors duration-150 ease-out hover:border-primary hover:text-primary"
        >
          <Settings size={13} strokeWidth={1.9} />
          Thiết lập mục tiêu chứng chỉ
        </motion.button>
        <GroupCertSettingsModal
          group={group}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </>
    );
  }

  return (
    <motion.div
      variants={sidebarFadeUp}
      className="mb-4 rounded-[13px] p-3"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-muted)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold" style={{ color: "var(--ink)" }}>
            {group.certName}
          </p>
          {group.certCode && (
            <p className="truncate text-[11px]" style={{ color: "var(--ink-faint)" }}>
              Chứng chỉ mục tiêu: {group.certCode}
            </p>
          )}
        </div>
        {isSelf && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            title="Sửa mục tiêu chứng chỉ"
            aria-label="Sửa mục tiêu chứng chỉ"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <Settings size={13} strokeWidth={1.9} />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ProgressBar percent={progress?.progressPercent ?? 0} className="flex-1" />
        <span className="shrink-0 text-[11px] font-semibold" style={{ color: "var(--ink-muted)" }}>
          {progress ? `${progress.progressPercent}%` : "…"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <SidebarMetric
          icon={<CalendarDays size={12} strokeWidth={1.9} />}
          label="Ngày học"
          value={progress ? String(progress.totalStudyDays) : "…"}
        />
        <SidebarMetric
          icon={<FileText size={12} strokeWidth={1.9} />}
          label="Bài viết"
          value={String(group.postCount)}
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

      <GroupCertSettingsModal
        group={group}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </motion.div>
  );
}
