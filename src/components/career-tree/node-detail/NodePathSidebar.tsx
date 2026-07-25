"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Folder, FileText, Target } from "lucide-react";
import SectionLabel from "./SectionLabel";
import type { AncestorPathItem } from "@/lib/career-tree/node-path";

const KIND_ICON = {
  BRANCH: Folder,
  TOPIC: FileText,
} as const;

type NodePathSidebarProps = {
  workspaceId: string;
  ancestorPath: AncestorPathItem[];
};

function tagFor(index: number, length: number): string {
  if (index === 0) return "Lộ trình";
  if (index === length - 1) return "Node hiện tại";
  if (index === length - 2) return "Node cha";
  return "Nhánh";
}

const NodePathSidebar = ({ workspaceId, ancestorPath }: NodePathSidebarProps) => {
  const router = useRouter();

  return (
    <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border">
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => router.push(`/w/${workspaceId}`)}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
          Chi tiết Node
        </button>
      </div>

      <div className="px-4 pb-4">
        <SectionLabel>Đường dẫn đến node này</SectionLabel>
        <div className="mt-3 flex flex-col">
          {ancestorPath.map((item, i) => {
            const isLast = i === ancestorPath.length - 1;
            const Icon = item.depth === 0 ? Target : KIND_ICON[item.kind];
            const tag = tagFor(i, ancestorPath.length);

            const row = (
              <div
                className={`flex items-start gap-2 rounded-lg px-2 py-2 ${
                  isLast
                    ? "border border-border bg-active-bg"
                    : "transition-colors duration-150 ease-out hover:bg-hover-bg"
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0 text-icon-active"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="text-xs text-ink-faint">{tag}</p>
                </div>
              </div>
            );

            return (
              <div key={item.id} className="relative">
                {i < ancestorPath.length - 1 && (
                  <span className="absolute top-9 left-[19px] h-[calc(100%-8px)] w-px bg-tree-line" />
                )}
                {isLast ? (
                  row
                ) : (
                  <Link href={`/w/${workspaceId}/nodes/${item.id}`}>{row}</Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NodePathSidebar;
