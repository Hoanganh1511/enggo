"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { cn } from "@/lib/utils";
import { extractQuestionPickerToc } from "@/lib/docs/question-picker-toc";
import { SeriesQuestionPickerToc } from "./SeriesQuestionPickerToc";
import type { EntryBlockButton, EntryContentBlock } from "@/lib/api/content-series";

// Danh sach khoi noi dung o DAU 1 Entry (truoc than bai markdown), sap xep
// duoc trong SeriesEntryForm.tsx - yeu cau nguoi dung: "chia làm nửa trên...
// custom thêm đa dạng các element... sắp xếp thứ tự hiển thị". Thay the cho
// <SeriesQuestionPickerToc> hardcode 1 vi tri co dinh truoc day - gio TOC box
// chi la 1 trong 4 LOAI khoi (toc/install/buttonGroup/callout), thu tu HIEN
// THI = thu tu trong mang `blocks`.
//
// Backward-compat: entry CHUA tung dung tinh nang nay (blocks null/rong) -
// fallback dung 1 khoi TOC ngam dinh, giu NGUYEN hanh vi hien thi CU, KHONG
// can migrate du lieu cho cac Entry co san.
export function SeriesEntryContentBlocks({
  blocks,
  contentMarkdown,
}: {
  blocks: EntryContentBlock[] | null | undefined;
  contentMarkdown: string;
}) {
  const resolved: EntryContentBlock[] =
    blocks && blocks.length > 0 ? blocks : [{ id: "legacy-toc", type: "toc" }];

  return (
    <div className="mt-6 flex flex-col gap-6">
      {resolved.map((block) => (
        <EntryContentBlockRenderer
          key={block.id}
          block={block}
          contentMarkdown={contentMarkdown}
        />
      ))}
    </div>
  );
}

function EntryContentBlockRenderer({
  block,
  contentMarkdown,
}: {
  block: EntryContentBlock;
  contentMarkdown: string;
}) {
  switch (block.type) {
    case "toc":
      return <SeriesQuestionPickerToc items={extractQuestionPickerToc(contentMarkdown)} />;
    case "install":
      return <InstallBlock block={block} />;
    case "buttonGroup":
      return (
        <div className="flex flex-wrap items-center gap-2.5">
          {block.buttons.map((button) => (
            <EntryBlockButtonLink key={button.id} button={button} />
          ))}
        </div>
      );
    case "callout":
      return <CalloutBlock block={block} />;
    default:
      return null;
  }
}

function InstallBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "install" }>;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(block.command)
      .then(() => {
        setCopied(true);
        toast.success("Đã copy lệnh");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.danger("Không copy được, thử lại sau."));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between gap-3 bg-[#0d1117] px-4 py-3">
        <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-pre text-[#e6edf3]">
          {block.command}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy lệnh"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#8b949e] transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      {(block.description || (block.buttons && block.buttons.length > 0)) && (
        <div className="font-content flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          {block.description && (
            <p className="text-[13px] text-ink-faint">{block.description}</p>
          )}
          {block.buttons && block.buttons.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {block.buttons.map((button) => (
                <EntryBlockButtonLink key={button.id} button={button} compact />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CalloutBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "callout" }>;
}) {
  return (
    // -ml-6 lg:-ml-10 CHI BEN TRAI - dung y het ky thuat full-bleed da giai
    // quyet cho <hr> trong EntryBody (xem comment o do): khoi nay nam TRONG
    // <article> (flex-1, khong padding rieng) nen BEN PHAI khong can bleed gi
    // ca, con -mr se keo no tran qua khoang gap-6 + <aside> TOC ben phai.
    <div className="font-content -ml-6 rounded-r-xl bg-surface-muted px-6 py-6 lg:-ml-10 lg:px-10">
      {block.eyebrow && (
        <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          {block.eyebrow}
        </p>
      )}
      <p className="mt-1 text-[17px] font-bold text-ink">{block.title}</p>
      {block.description && (
        <p className="mt-1.5 text-[14px] text-ink-muted">{block.description}</p>
      )}
    </div>
  );
}

const BUTTON_STYLE_CLASS: Record<EntryBlockButton["style"], string> = {
  "solid-yellow": "bg-accent-gold text-ink hover:opacity-90",
  "outline-black": "border border-ink text-ink hover:bg-hover-bg",
  "ghost-gray": "text-ink-muted hover:text-ink",
};

function EntryBlockButtonLink({
  button,
  compact,
}: {
  button: EntryBlockButton;
  compact?: boolean;
}) {
  const isExternal = /^https?:\/\//.test(button.url);
  const className = cn(
    "inline-flex shrink-0 items-center gap-1 rounded-lg font-medium transition-colors duration-150 ease-out",
    compact ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13.5px]",
    BUTTON_STYLE_CLASS[button.style],
  );

  if (isExternal) {
    return (
      <a
        href={button.url}
        target={button.openInNewTab ? "_blank" : undefined}
        rel={button.openInNewTab ? "noreferrer" : undefined}
        className={className}
      >
        {button.label}
      </a>
    );
  }
  return (
    <Link href={button.url} target={button.openInNewTab ? "_blank" : undefined} className={className}>
      {button.label}
    </Link>
  );
}
