"use client";
import { useState } from "react";
import Link from "next/link";
import { NotebookPen, BookOpen, Laptop, CircleHelp, Folder } from "lucide-react";
import AddChildBox from "./AddChildBox";
import LearningStreak from "@/components/ui/learning-streak";
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import type { ApiNodeListItem } from "@/lib/api/types";

type TopicsTabProps = {
  workspaceId: string;
  childNodes: ApiNodeListItem[];
  onAddChild: (name: string) => void;
};

const Stat = ({
  icon: Icon,
  value,
  label,
  alwaysShow,
}: {
  icon: typeof NotebookPen;
  value: number;
  label: string;
  alwaysShow?: boolean;
}) => {
  if (value === 0 && !alwaysShow) return null;
  return (
    <span
      title={`${label}: ${value}`}
      className="flex items-center gap-1 text-xs tabular-nums text-ink-muted"
    >
      <Icon size={12} strokeWidth={1.75} />
      {value}
    </span>
  );
};

function ChildNodeCard({
  workspaceId,
  child,
}: {
  workspaceId: string;
  child: ApiNodeListItem;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <HoverCardRoot
      open={previewOpen}
      onOpenChange={setPreviewOpen}
      openDelay={300}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors duration-150 ease-out hover:border-hover-border hover:bg-hover-bg">
          <Link
            href={`/w/${workspaceId}/nodes/${child.id}`}
            className="flex flex-col gap-2"
          >
            <span className="truncate text-sm font-medium text-ink">
              {child.title}
            </span>
            {child.goal && (
              <span className="truncate text-xs italic text-ink-muted">
                {child.goal}
              </span>
            )}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Stat
                icon={NotebookPen}
                value={child.cardCount}
                label="Ghi chú"
                alwaysShow
              />
              <Stat
                icon={BookOpen}
                value={child.resourceCount}
                label="Tài liệu"
              />
              <Stat
                icon={Laptop}
                value={child.practiceCount}
                label="Buổi thực hành"
              />
              <Stat
                icon={CircleHelp}
                value={child.openIssueCount}
                label="Vấn đề tồn đọng"
              />
            </div>
            <LearningStreak
              streak={child.streak}
              lastActivity={child.lastActivity}
            />
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        open={previewOpen}
        side="right"
        align="start"
        className="z-50 w-56 rounded-md border border-border bg-surface p-3 shadow-dropdown"
      >
        <p className="truncate text-sm font-medium text-ink">{child.title}</p>
        <div className="mt-2 flex flex-col gap-1.5 text-xs text-ink-muted">
          <span>Streak: {child.streak.current} ngày</span>
          <span>Ghi chú: {child.cardCount}</span>
          <span>Tài liệu: {child.resourceCount}</span>
          <span>Vấn đề: {child.openIssueCount}</span>
        </div>
      </HoverCardContent>
    </HoverCardRoot>
  );
}

const TopicsTab = ({ workspaceId, childNodes, onAddChild }: TopicsTabProps) => {
  return (
    <div className="flex flex-col gap-6">
      <AddChildBox onAddChild={onAddChild} />
      {childNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Folder size={20} strokeWidth={1.75} className="text-ink-disabled" />
          <p className="text-sm text-ink-muted">Chưa có nhánh con nào.</p>
          <p className="text-xs text-ink-faint">
            Thêm nhánh con để bắt đầu xây dựng cây sự nghiệp của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
          {childNodes.map((child) => (
            <ChildNodeCard
              key={child.id}
              workspaceId={workspaceId}
              child={child}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsTab;
