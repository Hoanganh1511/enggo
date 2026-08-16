"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { generateHTML } from "@tiptap/core";
import { Check, FileTextIcon } from "lucide-react";
import type { ApiDocumentSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
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
  selectable = false,
  selected = false,
  onToggleSelect,
  active = false,
}: {
  doc: ApiDocumentSummary;
  index: number;
  username: string;
  workspaceId: string;
  // Che do "chon bai viet de gop nhom" (xem GroupArticleToc.tsx) - khi bat,
  // ca hang tro thanh 1 checkbox (khong dieu huong nua) thay vi Link.
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  // Bai dang MO trong ArticleReaderPane luc nay (so slug voi URL hien tai,
  // tinh o GroupArticleToc.tsx) - khac `selected` (che do chon nhieu de gop
  // series), co the dung DONG THOI (dang doc 1 bai, van bat che do chon o
  // cac bai khac). layoutId dung CHUNG 1 ten xuyen suot danh sach de thanh
  // active truot muot giua cac hang khi doi bai.
  active?: boolean;
}) {
  const overviewHtml = useMemo(() => {
    if (!doc.overview) return null;
    const html = generateHTML(doc.overview, getOverviewExtensions());
    // StarterKit luon sinh it nhat 1 <p></p> rong khi khong co noi dung -
    // bo qua case do thay vi hien 1 box trong (so text sau khi strip tag).
    return html.replace(/<[^>]*>/g, "").trim().length > 0 ? html : null;
  }, [doc.overview]);

  const rowClassName = cn(
    "group relative -mx-2 flex items-start gap-1.5 rounded-[9px] px-2 py-1.5 text-left transition-colors duration-150 ease-out",
    selectable && "cursor-pointer",
    selected && "bg-community-accent/8",
  );

  const inner = (
    <>
      {active && (
        <motion.span
          layoutId="groupTocActiveBar"
          className="absolute top-1 bottom-1 left-0 w-0.75 rounded-full"
          style={{ background: "var(--primary)" }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      {selectable ? (
        <span
          className={cn(
            "mt-1 flex size-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 ease-out",
            selected
              ? "border-community-accent bg-community-accent text-white"
              : "border-border text-transparent",
          )}
        >
          <Check size={11} strokeWidth={3} />
        </span>
      ) : (
        <FileTextIcon className="text-primary mt-1 size-4 shrink-0" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-[12px] leading-relaxed group-hover:underline group-hover:decoration-primary group-hover:decoration-dashed group-hover:decoration-2 group-hover:underline-offset-[6px]">
          <span style={{ color: active ? "var(--primary)" : "var(--ink)" }}>
            #{index + 1}:
          </span>{" "}
          <span style={{ color: active ? "var(--primary)" : "var(--ink)" }}>
            {doc.title}
          </span>
        </span>
        {/* {overviewHtml && (
          <div
            className={OVERVIEW_PROSE_CLASS + " px-3 py-2"}
            style={{ color: "var(--ink-muted)" }}
            dangerouslySetInnerHTML={{ __html: overviewHtml }}
          />
        )} */}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      {selectable ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onToggleSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleSelect?.();
            }
          }}
          className={rowClassName}
          style={{
            background: active && !selected ? "var(--active-bg)" : undefined,
          }}
        >
          {inner}
        </div>
      ) : (
        <Link
          href={`/workspace/${username}/${workspaceId}/${doc.slug}`}
          className={rowClassName}
          style={{ background: active ? "var(--active-bg)" : undefined }}
        >
          {inner}
        </Link>
      )}
    </motion.div>
  );
}
