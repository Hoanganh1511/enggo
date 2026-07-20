"use client";
import Link from "next/link";
import { NotebookPen, BookOpen, Laptop, CircleHelp } from "lucide-react";
import AddChildBox from "./AddChildBox";
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
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors duration-150 ease-out hover:border-hover-border hover:bg-hover-bg"
            >
              <span className="truncate text-sm font-medium text-ink">
                {child.title}
              </span>
              {child.goal && (
                <span className="truncate text-xs italic text-ink-muted">
                  {child.goal}
                </span>
              )}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsTab;
