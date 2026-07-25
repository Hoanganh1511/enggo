"use client";

import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Trash2,
  Pencil,
  Check,
  MoreVertical,
  NotebookPen,
  GitBranch,
  Clock,
  Loader2,
  CheckCircle2,
  PlayCircle,
  Shuffle,
} from "lucide-react";
import EditorPane from "./EditorPane";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
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
import type { ApiIssue, ApiNodeListItem, Difficulty, NodeKind } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import ResourcesTab from "./ResourcesTab";
import type { ApiResource, CardKind, ResourceType } from "@/lib/api/types";

type TabKey =
  | "overview"
  | "resources"
  | "practice"
  | "notes"
  | "stats"
  | "topics"
  | "issues";
export type SaveStatus = "idle" | "saving" | "saved";

const ALL_TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Tổng quan" },
  { key: "resources", label: "Tài liệu & Nguồn học" },
  { key: "practice", label: "Công việc thực hành" },
  { key: "notes", label: "Ghi chú" },
  { key: "stats", label: "Thống kê" },
  { key: "topics", label: "Các chủ đề" },
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
    createdAt: string;
    lastActivity: string | null;
    streak: LearningStreakData;
    hasMoreActivities?: boolean;
    isLoadingMoreActivities?: boolean;
    kind: NodeKind;
    category: string | null;
    difficulty: Difficulty | null;
    estimatedTime: string | null;
    prerequisites: string[];
    learningOutcomes: string[];
    cardCount: number;
    parentId: string | null;
  };
  parentName: string | null;
  branchName: string | null;
  saveStatus: SaveStatus;
  onContentChange: (json: Record<string, unknown>) => void;
  onGoalChange: (goal: string) => void;
  onAddChild: (name: string, kind: NodeKind) => void;
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
  onKindChange: (kind: NodeKind) => void;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty) => void;
  onEstimatedTimeChange: (value: string) => void;
  onLearningOutcomesChange: (items: string[]) => void;
  onPrerequisitesChange: (items: string[]) => void;
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
  parentName,
  branchName,
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
  onKindChange,
  onCategoryChange,
  onDifficultyChange,
  onEstimatedTimeChange,
  onLearningOutcomesChange,
  onPrerequisitesChange,
}: NodeDetailViewProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [goal, setGoal] = useState(node.goal ?? "");
  // 1 cong tac sua chung cho toan trang (Mo ta, checklist, Thong tin, Chi
  // tiet node...) thay vi tung state rieng cho tung phan nhu ban cu.
  const [editMode, setEditMode] = useState(false);

  const percent = node.total > 0 ? Math.min(100, (node.done / node.total) * 100) : 0;
  const Icon = node.icon;

  const handleGoalChange = (value: string) => {
    setGoal(value);
    onGoalChange(value);
  };

  const handleStartLearning = () => {
    setActiveTab("notes");
    setEditMode(true);
  };

  const showTopicsTab = childNodes.length > 0 || node.kind === "BRANCH";
  const tabs = ALL_TABS.filter((t) => t.key !== "topics" || showTopicsTab);

  const noteActivities = node.activities.filter((a) => a.kind !== "PRACTICE");
  const practiceActivities = node.activities.filter((a) => a.kind === "PRACTICE");

  return (
    <Tooltip.Provider delayDuration={300}>
    <div className="flex h-full w-full flex-col overflow-y-auto bg-surface">
      <div className="flex items-start justify-between gap-4 px-8 pt-6 pb-2 2xl:px-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
              <Icon size={16} strokeWidth={1.75} className="text-icon-active" />
            </span>
            <h1 className="truncate text-lg font-medium text-ink">
              {node.title}
            </h1>
            {editMode && (
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

          <div className="mt-3 flex max-w-md items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-ink-muted">
              {Math.round(percent)}% hoàn thành
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleStartLearning}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            <PlayCircle size={14} strokeWidth={1.75} />
            Bắt đầu học
          </button>

          <button
            type="button"
            title={editMode ? "Xong" : "Sửa"}
            onClick={() => setEditMode((v) => !v)}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
              editMode
                ? "bg-active-bg text-primary"
                : "text-icon hover:bg-hover-bg hover:text-icon-hover"
            }`}
          >
            {editMode ? <Check size={14} strokeWidth={1.75} /> : <Pencil size={14} strokeWidth={1.75} />}
            Sửa
          </button>

          <DropdownMenuRoot open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Khác"
                className="flex size-8 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
              >
                <MoreVertical size={15} strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              open={menuOpen}
              align="end"
              className="z-50 w-56 rounded-md border border-border bg-surface p-1 shadow-dropdown"
            >
              <DropdownMenuItem
                onSelect={() =>
                  onKindChange(node.kind === "TOPIC" ? "BRANCH" : "TOPIC")
                }
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink outline-none transition-colors duration-150 ease-out data-highlighted:bg-hover-bg"
              >
                <Shuffle size={14} strokeWidth={1.75} />
                {node.kind === "TOPIC"
                  ? "Chuyển thành nhánh kiến thức"
                  : "Chuyển thành chủ đề cần học sâu"}
              </DropdownMenuItem>
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

      {/* Tab list */}
      <div className="mt-4 flex flex-col border-t border-border">
        <div className="flex flex-wrap items-center gap-1 px-8 2xl:px-10">
          {tabs.map((tab) => (
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
          {activeTab === "overview" && (
            <OverviewTab
              editable={editMode}
              goal={goal}
              onGoalChange={handleGoalChange}
              learningOutcomes={node.learningOutcomes}
              onLearningOutcomesChange={onLearningOutcomesChange}
              prerequisites={node.prerequisites}
              onPrerequisitesChange={onPrerequisitesChange}
              category={node.category}
              onCategoryChange={onCategoryChange}
              difficulty={node.difficulty}
              onDifficultyChange={onDifficultyChange}
              estimatedTime={node.estimatedTime}
              onEstimatedTimeChange={onEstimatedTimeChange}
              workspaceId={workspaceId}
              parentId={node.parentId}
              parentName={parentName}
              branchName={branchName}
              createdAt={node.createdAt}
              updatedAt={node.updatedAt}
              done={node.done}
              total={node.total}
              lastActivity={node.lastActivity}
              cardCount={node.cardCount}
              resources={resources}
              onViewAllResources={() => setActiveTab("resources")}
              onViewStats={() => setActiveTab("stats")}
            />
          )}
          {activeTab === "resources" && (
            <ResourcesTab
              resources={resources}
              onAddResource={onAddResource}
              onDeleteResource={onDeleteResource}
            />
          )}
          {activeTab === "practice" && (
            <ActivityLog
              activities={practiceActivities}
              onAddActivity={onAddActivity}
              fixedKind="PRACTICE"
              hasMore={node.hasMoreActivities}
              isLoadingMore={node.isLoadingMoreActivities}
              onLoadMore={onLoadMoreActivities}
              hideLabel
            />
          )}
          {activeTab === "notes" && (
            <div className="flex flex-col gap-4">
              <div className="h-56 2xl:h-64">
                <EditorPane
                  content={node.content}
                  onContentChange={onContentChange}
                  editable={editMode}
                />
              </div>
              <ActivityLog
                activities={noteActivities}
                onAddActivity={onAddActivity}
                fixedKind="NOTE"
                hasMore={node.hasMoreActivities}
                isLoadingMore={node.isLoadingMoreActivities}
                onLoadMore={onLoadMoreActivities}
                hideLabel
              />
            </div>
          )}
          {activeTab === "stats" && (
            <StatsTab
              streak={node.streak}
              lastActivity={node.lastActivity}
              done={node.done}
              total={node.total}
              cardCount={node.cardCount}
              practiceCount={practiceActivities.length}
              resourceCount={resources.length}
              openIssueCount={issues.filter((i) => !i.resolved).length}
              branches={node.branches}
            />
          )}
          {activeTab === "topics" && (
            <TopicsTab
              workspaceId={workspaceId}
              childNodes={childNodes}
              onAddChild={onAddChild}
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
