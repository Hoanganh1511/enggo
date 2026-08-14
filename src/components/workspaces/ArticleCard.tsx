"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileTextIcon } from "lucide-react";
import type { ApiDocumentSummary } from "@/lib/api/types";

// Hang bai viet trong ArticleList - UI toi gian (bullet nho + "#so_thu_tu:
// tieu de"). Dieu huong THAT sang /workspace/[username]/[workspaceId]/[slug]
// (chia se layout + sidebar voi trang browse, xem layout.tsx cung thu muc) -
// khong con onClick chon preview trong ArticleDetailPanel nhu ban truoc.
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
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Link
        href={`/workspace/${username}/${workspaceId}/${doc.slug}`}
        className="-mx-2 flex items-start gap-2 rounded-[9px] px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
      >
        <span className="min-w-0 text-[15px] leading-relaxed">
          <FileTextIcon className="text-primary mb-1 inline-block size-3.5" />
          <span style={{ color: "var(--ink)" }}> #{index + 1}:</span>{" "}
          <span style={{ color: "var(--ink)" }}>{doc.title}</span>
        </span>
      </Link>
    </motion.div>
  );
}
