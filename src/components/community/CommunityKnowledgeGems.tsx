"use client";

import { useState } from "react";
import { GemIcon } from "lucide-react";
import type { CommunityKnowledgeBranch } from "@/content/community-mock";
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

// 1 "vien ngoc" - hover vao thay ten nhanh + thanh tien do. Tu quan ly state
// mo/dong rieng (moi vien can 1 hover state doc lap voi cac vien khac).
function KnowledgeGem({ branch }: { branch: CommunityKnowledgeBranch }) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCardRoot open={open} onOpenChange={setOpen} openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span
          className="flex size-4 shrink-0 cursor-default items-center justify-center rounded-full"
          style={{ backgroundColor: `${branch.accent}1a`, color: branch.accent }}
        >
          <GemIcon size={10} strokeWidth={2.5} />
        </span>
      </HoverCardTrigger>
      <HoverCardContent open={open} side="top" align="center" className="z-50">
        <div className="w-40 rounded-lg border border-border bg-surface p-2.5 shadow-lg">
          <p className="text-xs font-semibold text-ink">{branch.label}</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full"
              style={{ width: `${branch.progressPercent}%`, backgroundColor: branch.accent }}
            />
          </div>
          <p className="mt-1 text-[11px] text-ink-faint">{branch.progressPercent}% hoàn thành</p>
        </div>
      </HoverCardContent>
    </HoverCardRoot>
  );
}

// Hang "vien ngoc" dai dien cac nhanh kien thuc 1 tac gia dang hoc - dat
// canh user info trong CommunityPostCard.tsx. An hoan toan neu tac gia chua
// co knowledgeBranches (KHONG bia du lieu).
export function CommunityKnowledgeGems({
  branches,
}: {
  branches: CommunityKnowledgeBranch[] | undefined;
}) {
  if (!branches || branches.length === 0) return null;

  return (
    <span className="flex shrink-0 items-center gap-1">
      {branches.map((branch) => (
        <KnowledgeGem key={branch.label} branch={branch} />
      ))}
    </span>
  );
}
