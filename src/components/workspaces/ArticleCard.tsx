"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { generateHTML } from "@tiptap/core";
import { FileTextIcon } from "lucide-react";
import type { ApiDocumentSummary } from "@/lib/api/types";
import { getOverviewExtensions, OVERVIEW_PROSE_CLASS } from "./post-extensions";

// Hang bai viet trong ArticleList - "#so_thu_tu: tieu de" + (neu co) 1 box
// tong quan noi dung ngay duoi (Document.overview, Tiptap JSON schema han
// che - xem post-extensions.ts). generateHTML() convert JSON -> HTML string
// TINH (khong mount 1 Tiptap editor instance/the - danh sach co the co nhieu
// bai, mount editor rieng cho tung the se rat ton). Dieu huong THAT sang
// /workspace/[username]/[workspaceId]/[slug] (chia se layout + sidebar voi
// trang browse, xem layout.tsx cung thu muc) - khong con onClick chon
// preview trong ArticleDetailPanel nhu ban truoc.
export function ArticleCard({
  doc,
  index,
  username,
  workspaceId,
}: {
  doc: ApiDocumentSummary;
  index: number;
  username: string;
  workspaceId: string;
}) {
  const overviewHtml = useMemo(() => {
    if (!doc.overview) return null;
    const html = generateHTML(doc.overview, getOverviewExtensions());
    // StarterKit luon sinh it nhat 1 <p></p> rong khi khong co noi dung -
    // bo qua case do thay vi hien 1 box trong (so text sau khi strip tag).
    return html.replace(/<[^>]*>/g, "").trim().length > 0 ? html : null;
  }, [doc.overview]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Link
        href={`/workspace/${username}/${workspaceId}/${doc.slug}`}
        className="-mx-2 flex flex-col gap-1.5 rounded-[9px] px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
      >
        <span className="min-w-0 text-[15px] leading-relaxed">
          <FileTextIcon className="text-primary mb-1 inline-block size-3.5" />
          <span style={{ color: "var(--ink)" }}> #{index + 1}:</span>{" "}
          <span style={{ color: "var(--ink)" }}>{doc.title}</span>
        </span>
        {overviewHtml && (
          <div
            className={OVERVIEW_PROSE_CLASS + " rounded-lg border border-border bg-surface-muted px-3 py-2"}
            style={{ color: "var(--ink-muted)" }}
            dangerouslySetInnerHTML={{ __html: overviewHtml }}
          />
        )}
      </Link>
    </motion.div>
  );
}
