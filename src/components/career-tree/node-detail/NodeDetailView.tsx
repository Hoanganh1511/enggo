"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import EditorPane from "./EditorPane";
import ActivityLog, { type Activity } from "./ActivityLog";
import TopicsTab from "./TopicsTab";
import IssuesTab from "./IssuesTab";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import type { ApiIssue, ApiNodeListItem } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import ResourcesTab from "./ResourcesTab";
import type { ApiResource, CardKind, ResourceType } from "@/lib/api/types";
type TabKey = "topics" | "journal" | "resources" | "issues";

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
    hasMoreActivities?: boolean;
    isLoadingMoreActivities?: boolean;
  };
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

const NodeDetailView = ({
  workspaceId,
  childNodes,
  node,
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
  const [goal, setGoal] = useState(node.goal ?? "");

  const handleGoalChange = (value: string) => {
    setGoal(value);
    onGoalChange(value);
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="flex items-start justify-between gap-4 px-8 pb-6 2xl:px-10">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-medium text-ink">
            {node.title}
          </h1>
          <p className="truncate text-xs tabular-nums text-ink-muted">
            {node.subtitle} · {node.branches} nhánh · {node.done}/{node.total}
          </p>
        </div>
      </div>

      {/* Mục tiêu — tóm tắt ngắn gọn, nằm trên khối Chi tiết node */}
      <div className="shrink-0 px-8 pb-4 2xl:px-10">
        <input
          type="text"
          value={goal}
          onChange={(e) => handleGoalChange(e.target.value)}
          placeholder="🎯 Mục tiêu ngắn gọn của chủ đề này..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink placeholder:text-ink-faint placeholder:font-normal focus:border-focus-border focus:outline-none"
        />
      </div>

      {/* Chi tiết node — chiều cao vừa đủ, không chiếm hết màn hình như trước */}
      <div className="shrink-0 px-8 pb-6 2xl:px-10">
        <div className="h-56 2xl:h-64">
          <EditorPane
            content={node.content}
            onContentChange={onContentChange}
          />
        </div>
      </div>

      {/* Tab list: Các chủ đề / Nhật ký hoạt động / Tài liệu sử dụng / Vấn đề tồn đọng */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-border">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 2xl:px-10">
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

      <div className="flex items-center justify-between border-t border-border px-8 py-4">
        <p className="text-xs text-ink">
          Cập nhật lần cuối: {formatRelativeTime(node.updatedAt)}
        </p>
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-muted">
              Xóa node và {node.branches} nhánh con?
            </span>
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
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-disabled transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={13} strokeWidth={1.75} />
            Xóa node này
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeDetailView;
