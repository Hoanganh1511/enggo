"use client";

import { useState } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import SkillReportDetailModal from "../SkillReportDetailModal";

type SkillReportPost = Extract<Post, { kind: "skill-report" }>;

// Khac voi cac PostBody con lai trong thu muc nay (StatusBodies.tsx, ...) -
// day la component DUY NHAT can local state, vi no tu quan ly modal "xem chi
// tiet" (SkillReportDetailModal.tsx) rieng cho tung the bai dang trong feed.
// Badge category dung dung mau accent that cua Knowledge Block
// (post.categoryAccent, resolve san luc dang bai o PostComposer.tsx bang
// getBlockAccentColor) de dong bo hinh anh voi KnowledgeBlockCard.tsx.
export function SkillReportBody({ post }: { post: SkillReportPost }) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border p-3">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: hexToRgba(post.categoryAccent, 0.14),
            color: post.categoryAccent,
          }}
        >
          <Layers size={11} strokeWidth={2.25} />
          {post.categoryName}
        </span>

        <p className="text-sm font-semibold text-ink">{post.nodeTitle}</p>
        <p className="text-sm wrap-break-word text-ink-muted">{post.content}</p>

        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-1 flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:underline"
        >
          Xem chi tiết
          <ArrowUpRight size={13} strokeWidth={1.75} />
        </button>
      </div>

      <SkillReportDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        workspaceId={post.workspaceId}
        nodeId={post.nodeId}
        nodeTitle={post.nodeTitle}
        categoryName={post.categoryName}
        categoryAccent={post.categoryAccent}
      />
    </>
  );
}
