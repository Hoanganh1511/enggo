"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import AddChildBox from "./AddChildBox";
import type { ApiNodeListItem } from "@/lib/api/types";

type TopicsTabProps = {
  workspaceId: string;
  childNodes: ApiNodeListItem[];
  onAddChild: (name: string) => void;
};

const TopicsTab = ({ workspaceId, childNodes, onAddChild }: TopicsTabProps) => {
  return (
    <div className="flex flex-col gap-6">
      <AddChildBox onAddChild={onAddChild} />
      {childNodes.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có chủ đề con nào.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
          {childNodes.map((child) => (
            <Link
              key={child.id}
              href={`/w/${workspaceId}/nodes/${child.id}`}
              className="flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors duration-150 ease-out hover:border-hover-border hover:bg-hover-bg"
            >
              <span className="truncate text-sm font-medium text-ink">
                {child.title}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                <GitBranch size={12} strokeWidth={1.75} />
                {child.cardCount} ghi chú
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsTab;
