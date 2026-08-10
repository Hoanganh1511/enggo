"use client";

import { useState } from "react";
import type { CommunityKnowledgeBranch } from "@/lib/community/types";
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

// 1 chip ky nang (24px cao) - hover vao thay % thanh thao. Mau nen/vien lay
// tu branch.accent (khong dung 1 mau chung cho moi chip).
function SkillChip({ branch }: { branch: CommunityKnowledgeBranch }) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCardRoot
      open={open}
      onOpenChange={setOpen}
      openDelay={150}
      closeDelay={80}
    >
      <HoverCardTrigger asChild>
        <span
          className="flex h-6 cursor-default items-center rounded-full border px-2.5 text-[11px] font-medium transition-[filter] duration-150 ease-out hover:brightness-110"
          style={{
            borderColor: `${branch.accent}33`,
            color: branch.accent,
            backgroundColor: `${branch.accent}0d`,
          }}
        >
          {branch.label}
        </span>
      </HoverCardTrigger>
      <HoverCardContent open={open} side="top" align="start">
        <div className="w-40 rounded-lg border border-black/6 bg-white p-2.5 shadow-[0_6px_24px_rgba(50,50,93,0.12)]">
          <p className="text-xs font-semibold text-ink">{branch.label}</p>
          <p className="text-[11px] text-ink-faint">Mức độ thành thạo</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/6">
            <div
              className="h-full rounded-full"
              style={{
                width: `${branch.progressPercent}%`,
                backgroundColor: branch.accent,
              }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] font-medium text-ink-muted">
            {branch.progressPercent}%
          </p>
        </div>
      </HoverCardContent>
    </HoverCardRoot>
  );
}

// Hang chip ky nang chuyen mon - dat ngay duoi ten trong CommunityPostCard.tsx
// (chi khi tac gia co profile, xem brief thiet ke). An hoan toan neu khong
// co knowledgeBranches.
export function CommunitySkillChips({
  branches,
}: {
  branches: CommunityKnowledgeBranch[] | undefined;
}) {
  if (!branches || branches.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {branches.map((branch) => (
        <SkillChip key={branch.label} branch={branch} />
      ))}
    </div>
  );
}
