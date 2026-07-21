"use client";

import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Trash2,
  Pencil,
  Check,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  GitBranch,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import EditorPane from "./EditorPane";
import SectionLabel from "./SectionLabel";
import ActivityLog, { type Activity } from "./ActivityLog";
import TopicsTab from "./TopicsTab";
import IssuesTab from "./IssuesTab";
import LearningStreak, {
  type LearningStreakData,
} from "@/components/ui/learning-streak";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import type { ApiIssue, ApiNodeListItem } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import ResourcesTab from "./ResourcesTab";
import type { ApiResource, CardKind, ResourceType } from "@/lib/api/types";

type TabKey = "topics" | "journal" | "resources" | "issues";
export type SaveStatus = "idle" | "saving" | "saved";

const TABS: { key: TabKey; label: string }[] = [
  { key: "topics", label: "Các chủ đề" },
  { key: "journal", label: "Nhật ký hoạt động" },
  { key: "resources", label: "Tài liệu sử dụng" },
  { key: "issues", label: "Vấn đề tồn đọng" },
];

type NodeDetailViewProps = {
  workspaceId: string;
  childNodes: ApiNodeListItem[];
  node: {
    id: string;
    icon: LucideIcon;
    title: string;
    goal: string | null;
    subtitle: string;
    branches: number;
    done: number;
    total: number;
    content: Record<string, unknown> | null;
    activities: Activity[];
    updatedAt: string;
    lastActivity: string | null;
    streak: LearningStreakData;
    hasMoreActivities?: boolean;
    isLoadingMoreActivities?: boolean;
  };
  saveStatus: SaveStatus;
  onContentChange: (json: Record<string, unknown>) => void;
  onGoalChange: (goal: string) => void;
  onAddChild: (name: string) => void;
  onDelete: () => void;
  onAddActivity: (text: string, kind: CardKind) => void;
  onLoadMoreActivities: () => void;
  resources: ApiResource[];
  onAddResource: (data: {
    type: ResourceType;
    title: string;
    url: string;
  }) => void;
  onDeleteResource: (resourceId: string) => void;
  issues: ApiIssue[];
  onAddIssue: (question: string) => void;
  onToggleIssue: (issueId: string, resolved: boolean) => void;
  onDeleteIssue: (issueId: string) => void;
};

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-muted">
        <Loader2 size={11} strokeWidth={1.75} className="animate-spin" />
        Đang lưu...
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-success">
      <CheckCircle2 size={11} strokeWidth={1.75} />
      Đã lưu
    </span>
  );
}

const NodeDetailView = ({
  workspaceId,
  childNodes,
  node,
  saveStatus,
  onContentChange,
  onGoalChange,
  onAddChild,
  onDelete,
  onAddActivity,
  onLoadMoreActivities,
  resources,
  onAddResource,
  onDeleteResource,
  issues,
  onAddIssue,
  onToggleIssue,
  onDeleteIssue,
}: NodeDetailViewProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("topics");
  const [menuOpen, setMenuOpen] = useState(false);
  const [goal, setGoal] = useState(node.goal ?? "");
  // Node hoan toan trong (chua tung co goal/content) -> mo san de nhap lieu lan
  // dau; nguoc lai thu gon thanh dang tom tat, bam "Xem chi tiet" moi mo ra.
  const [isExpanded, setIsExpanded] = useState(
    !node.goal && !node.content,
  );
  // Neu chua co du lieu san, mo san che do sua cho tung phan (khong co gi de
  // "xem" ca) - nguoc lai mac dinh o che do xem, bam icon but moi vao sua.
  const [isGoalEditing, setIsGoalEditing] = useState(!node.goal);
  const [isContentEditing, setIsContentEditing] = useState(!node.content);

  const handleGoalChange = (value: string) => {
    setGoal(value);
    onGoalChange(value);
  };

  return (
    <Tooltip.Provider delayDuration={300}>
    <div className="flex h-full w-full flex-col overflow-y-auto bg-surface">
      <div className="flex items-start justify-between gap-4 px-8 pb-2 2xl:px-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-medium text-ink">
              {node.title}
            </h1>
            {(isGoalEditing || isContentEditing) && (
              <span className="shrink-0 rounded-full bg-active-bg px-2 py-0.5 text-[11px] font-medium text-primary">
                Đang chỉnh sửa...
              </span>
            )}
            <SaveStatusBadge status={saveStatus} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-ink-muted">
            <span className="flex items-center gap-1">
              <NotebookPen size={12} strokeWidth={1.75} />
              {node.subtitle}
            </span>
            <span className="text-ink-faint">·</span>
            <span className="flex items-center gap-1">
              <GitBranch size={12} strokeWidth={1.75} />
              {node.branches} nhánh
            </span>
            <span className="text-ink-faint">·</span>
            <span>
              {node.done}/{node.total}
            </span>
            <span className="text-ink-faint">·</span>
            <LearningStreak
              streak={node.streak}
              lastActivity={node.lastActivity}
              variant="inline"
            />
            <span className="text-ink-faint">·</span>
            <span className="flex items-center gap-1">
              <Clock size={12} strokeWidth={1.75} />
              Cập nhật {formatRelativeTime(node.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title={isExpanded ? "Thu gọn" : "Chỉnh sửa"}
            onClick={() => setIsExpanded((v) => !v)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <Pencil size={15} strokeWidth={1.75} />
          </button>

          <DropdownMenuRoot open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Tùy chọn khác"
                className="flex size-8 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
              >
                <MoreVertical size={15} strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              open={menuOpen}
              align="end"
              className="z-50 w-44 rounded-md border border-border bg-surface p-1 shadow-dropdown"
            >
              <DropdownMenuItem
                onSelect={() => setConfirmingDelete(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-disabled outline-none transition-colors duration-150 ease-out data-highlighted:bg-hover-bg data-highlighted:text-red-600"
              >
                <Trash2 size={14} strokeWidth={1.75} />
                Xóa node này
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      </div>

      {confirmingDelete && (
        <div className="mx-8 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs 2xl:mx-10">
          <span className="text-ink-muted">
            Xóa node và {node.branches} nhánh con? Không thể hoàn tác.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-white transition-colors duration-150 ease-out hover:bg-red-700"
            >
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      )}

      {isExpanded ? (
        <>
          {/* Mo ta ngan gon - moi trang thai (xem/sua) co icon but rieng */}
          <div className="shrink-0 px-8 pb-4 2xl:px-10">
            <div className="mb-1.5 flex items-center justify-between">
              <SectionLabel>Mô tả ngắn</SectionLabel>
              <button
                type="button"
                title={isGoalEditing ? "Xong" : "Sửa mô tả"}
                onClick={() => setIsGoalEditing((v) => !v)}
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
              >
                {isGoalEditing ? (
                  <Check size={13} strokeWidth={1.75} />
                ) : (
                  <Pencil size={13} strokeWidth={1.75} />
                )}
              </button>
            </div>
            {isGoalEditing ? (
              <textarea
                autoFocus
                value={goal}
                onChange={(e) => handleGoalChange(e.target.value)}
                placeholder="Mô tả ngắn gọn về chủ đề này (ví dụ: Vai trò, mục tiêu, những gì cần làm...)"
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink placeholder:text-ink-faint placeholder:font-normal focus:border-focus-border focus:outline-none"
              />
            ) : goal ? (
              <p className="rounded-lg border border-border px-3 py-2 text-sm whitespace-pre-wrap text-ink">
                {goal}
              </p>
            ) : (
              <p className="rounded-lg border border-dashed border-hover-border px-3 py-2 text-sm text-ink-faint italic">
                Chưa có mô tả — bấm biểu tượng bút để thêm.
              </p>
            )}
          </div>

          {/* Chi tiet node - full editor, chi hien toolbar khi dang sua */}
          <div className="shrink-0 px-8 pb-4 2xl:px-10">
            <div className="mb-1.5 flex items-center justify-between">
              <SectionLabel>Chi tiết node</SectionLabel>
              <button
                type="button"
                title={isContentEditing ? "Xong" : "Sửa chi tiết"}
                onClick={() => setIsContentEditing((v) => !v)}
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
              >
                {isContentEditing ? (
                  <Check size={13} strokeWidth={1.75} />
                ) : (
                  <Pencil size={13} strokeWidth={1.75} />
                )}
              </button>
            </div>
            <div className="h-56 2xl:h-64">
              <EditorPane
                content={node.content}
                onContentChange={onContentChange}
                editable={isContentEditing}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="mt-2 flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              <ChevronUp size={13} strokeWidth={1.75} />
              Thu gọn
            </button>
          </div>
        </>
      ) : (
        <div className="shrink-0 px-8 pb-4 2xl:px-10">
          {goal ? (
            <p className="line-clamp-2 text-sm text-ink-muted">{goal}</p>
          ) : (
            <p className="text-sm text-ink-faint italic">Chưa có mô tả.</p>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="mt-1.5 flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:underline"
          >
            Xem chi tiết
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Tab list: Các chủ đề / Nhật ký hoạt động / Tài liệu sử dụng / Vấn đề tồn đọng */}
      <div className="flex flex-col border-t border-border">
        <div className="flex items-center gap-1 px-8 2xl:px-10">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px cursor-pointer border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
                activeTab === tab.key
                  ? "border-primary text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-8 py-6 2xl:px-10">
          {activeTab === "topics" && (
            <TopicsTab
              workspaceId={workspaceId}
              childNodes={childNodes}
              onAddChild={onAddChild}
            />
          )}
          {activeTab === "journal" && (
            <ActivityLog
              activities={node.activities}
              onAddActivity={onAddActivity}
              hasMore={node.hasMoreActivities}
              isLoadingMore={node.isLoadingMoreActivities}
              onLoadMore={onLoadMoreActivities}
              hideLabel
            />
          )}
          {activeTab === "resources" && (
            <ResourcesTab
              resources={resources}
              onAddResource={onAddResource}
              onDeleteResource={onDeleteResource}
            />
          )}
          {activeTab === "issues" && (
            <IssuesTab
              issues={issues}
              onAddIssue={onAddIssue}
              onToggleIssue={onToggleIssue}
              onDeleteIssue={onDeleteIssue}
            />
          )}
        </div>
      </div>
    </div>
    </Tooltip.Provider>
  );
};

export default NodeDetailView;
