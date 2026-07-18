"use client";

import {
  Calendar,
  Clock,
  FolderTree,
  GitBranch,
  TrendingUp,
} from "lucide-react";
import type { ApiNodeListItem, ApiWorkspace } from "@/lib/api/types";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

type WorkspaceInfoBarProps = {
  workspace: ApiWorkspace;
  nodes: ApiNodeListItem[];
};

const WorkspaceInfoBar = ({ workspace, nodes }: WorkspaceInfoBarProps) => {
  const totalNodes = nodes.length;
  const rootBranches = nodes.filter((n) => n.depth === 1).length;
  const avgCompletion =
    totalNodes > 0
      ? Math.round(
          (nodes.reduce(
            (sum, n) =>
              sum +
              Math.min(n.cardCount, MAX_EXPECTED_CARDS) / MAX_EXPECTED_CARDS,
            0,
          ) /
            totalNodes) *
            100,
        )
      : 0;
  const latestActivity = nodes.reduce<string | null>((latest, n) => {
    if (!n.lastActivity) return latest;
    if (!latest || new Date(n.lastActivity) > new Date(latest))
      return n.lastActivity;
    return latest;
  }, null);

  const stats = [
    { key: "total", icon: FolderTree, label: `${totalNodes} node` },
    { key: "branches", icon: GitBranch, label: `${rootBranches} nhánh gốc` },
    {
      key: "completion",
      icon: TrendingUp,
      label: `${avgCompletion}% hoàn thành`,
    },
    {
      key: "activity",
      icon: Clock,
      label: latestActivity
        ? `Cập nhật ${formatRelativeTime(latestActivity)}`
        : "Chưa có hoạt động",
    },
    {
      key: "created",
      icon: Calendar,
      label: `Tạo ${formatRelativeTime(workspace.createdAt)}`,
    },
  ];

  return (
    <div className="inline-flex items-center rounded-lg px-3 py-1.5">
      {stats.map(({ key, icon: Icon, label }, i) => (
        <div key={key} className="flex items-center">
          {i > 0 && <div className="mx-2.5 h-4 w-px bg-border" />}
          <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-muted">
            <Icon size={13} strokeWidth={1.75} />
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceInfoBar;
