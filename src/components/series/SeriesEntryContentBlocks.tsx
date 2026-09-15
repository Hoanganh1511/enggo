"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Check, Copy } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { cn } from "@/lib/utils";
import { extractQuestionPickerToc } from "@/lib/docs/question-picker-toc";
import { SeriesQuestionPickerToc } from "./SeriesQuestionPickerToc";
import { SeriesEmailSignup } from "./SeriesEmailSignup";
import type { EntryBlockButton, EntryContentBlock, EntryContentBlockZone } from "@/lib/api/content-series";

// Danh sach khoi noi dung CO THE CHEN vao 3 vi tri ("zone") tren 1 trang
// Entry - yeu cau nguoi dung mo rong tu "nua tren" ban dau ("chia làm nửa
// trên... custom thêm đa dạng các element") sang 1 bo cuc day du: "top"
// (duoi subtitle, hanh vi CU), "middle" (giua cum Top va than bai markdown)
// va "bottom" (sau than bai, truoc pagination Next) - xem cach dung 3 lan
// component nay trong [entrySlug]/page.tsx (EntryHeader cho top+middle,
// EntryExtras cho bottom) va EntryContentBlocksEditor.tsx (form soan, cung
// chia 3 khu theo dung zone).
//
// Backward-compat: block cu (tao TRUOC khi co `zone`) khong co field nay -
// coi la "top" (xem `(block.zone ?? "top")`). Rieng zone "top" con giu fallback
// rong = 1 khoi TOC ngam dinh (hanh vi tu luc chua co blocks), NHUNG CHI khi
// entrySlug === "map" (xem loc block "toc" ben duoi - yeu cau nguoi dung
// rieng: "Chỉ trang Map mới cho phép... box TOC dạng khung... Còn đâu
// không cho").
export function SeriesEntryContentBlocks({
  blocks,
  contentMarkdown,
  entrySlug,
  zone = "top",
  emailCourseEnabled,
  emailCourseTitle,
  emailCourseDescription,
}: {
  blocks: EntryContentBlock[] | null | undefined;
  contentMarkdown: string;
  entrySlug: string;
  zone?: EntryContentBlockZone;
  // CHI zone middle/bottom moi co the chua block "newsletter" - zone "top"
  // khong can truyen (block "newsletter" khong bao gio co zone "top", xem
  // union type trong content-series.ts).
  emailCourseEnabled?: boolean;
  emailCourseTitle?: string;
  emailCourseDescription?: string;
}) {
  const isMap = entrySlug === "map";
  const isTopZone = zone === "top";
  const zoneBlocks = (blocks ?? []).filter((block) => (block.zone ?? "top") === zone);
  const base: EntryContentBlock[] =
    zoneBlocks.length > 0
      ? zoneBlocks
      : isTopZone && isMap
        ? [{ id: "legacy-toc", type: "toc" }]
        : [];
  const resolved = base.filter((block) => block.type !== "toc" || isMap);

  if (resolved.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {resolved.map((block) => (
        <EntryContentBlockRenderer
          key={block.id}
          block={block}
          contentMarkdown={contentMarkdown}
          emailCourseEnabled={emailCourseEnabled}
          emailCourseTitle={emailCourseTitle}
          emailCourseDescription={emailCourseDescription}
        />
      ))}
    </div>
  );
}

function EntryContentBlockRenderer({
  block,
  contentMarkdown,
  emailCourseEnabled,
  emailCourseTitle,
  emailCourseDescription,
}: {
  block: EntryContentBlock;
  contentMarkdown: string;
  emailCourseEnabled?: boolean;
  emailCourseTitle?: string;
  emailCourseDescription?: string;
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
    case "newsletter":
      if (!emailCourseEnabled) return null;
      return (
        <SeriesEmailSignup
          title={emailCourseTitle ?? "Nhận bài mới qua email"}
          description={emailCourseDescription ?? ""}
        />
      );
    case "botHelp":
      return <BotHelpBlock block={block} />;
    case "featurePromo":
      return <FeaturePromoBlock block={block} />;
    case "deeperCourse":
      return <DeeperCourseBlock block={block} />;
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

// "Not sure where to start? Ask the bot..." - hang gioi thieu ho tro, khop
// anh mau tham khao 2 (icon bot tron + text + 1 CTA ben phai).
function BotHelpBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "botHelp" }>;
}) {
  return (
    <div className="font-content flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
          <Bot size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">{block.title}</p>
          <p className="text-[13px] text-ink-muted">{block.description}</p>
        </div>
      </div>
      <EntryPromoButtonLink
        label={block.buttonLabel}
        url={block.buttonUrl}
        className="shrink-0 border border-ink bg-ink text-white hover:opacity-90"
      />
    </div>
  );
}

// The + eyebrow/title/description + CTA, nen mau nhan manh - khop anh mau
// tham khao 3.
function FeaturePromoBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "featurePromo" }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-5 rounded-xl bg-primary-soft p-5">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin go
            tay URL anh tuy y (khong qua upload S3 nhu coverImageUrl), khong
            gioi han theo next.config.ts images.remotePatterns duoc. */}
        <img src={block.imageUrl} alt="" className="size-full object-cover" />
      </div>
      <div className="font-content min-w-0 flex-1">
        {block.eyebrow && (
          <p className="font-mono text-[11px] font-semibold tracking-wide text-primary uppercase">
            {block.eyebrow}
          </p>
        )}
        <p className="mt-0.5 text-[16px] font-bold text-ink">{block.title}</p>
        {block.description && (
          <p className="mt-1 text-[13px] text-ink-muted">{block.description}</p>
        )}
      </div>
      <EntryPromoButtonLink
        label={block.buttonLabel}
        url={block.buttonUrl}
        className="shrink-0 bg-primary text-white hover:opacity-90"
      />
    </div>
  );
}

// Eyebrow/title/description + CTA, KHONG anh, nen xam nhat - khop anh mau
// tham khao 4 ("READY TO GO DEEPER?").
function DeeperCourseBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "deeperCourse" }>;
}) {
  return (
    <div className="font-content rounded-xl border border-border bg-surface-muted p-5">
      {block.eyebrow && (
        <p className="font-mono text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          {block.eyebrow}
        </p>
      )}
      <p className="mt-1 text-[16px] font-bold text-ink">{block.title}</p>
      {block.description && (
        <p className="mt-1 text-[13px] text-ink-muted">{block.description}</p>
      )}
      <EntryPromoButtonLink
        label={block.buttonLabel}
        url={block.buttonUrl}
        className="mt-3 bg-accent-gold text-ink hover:opacity-90"
      />
    </div>
  );
}

function EntryPromoButtonLink({
  label,
  url,
  className,
}: {
  label: string;
  url: string;
  className?: string;
}) {
  const isExternal = /^https?:\/\//.test(url);
  const sharedClassName = cn(
    "inline-flex w-fit items-center gap-1 rounded-lg px-4 py-2 text-[13.5px] font-semibold transition-opacity duration-150 ease-out",
    className,
  );
  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={sharedClassName}>
        {label}
      </a>
    );
  }
  return (
    <Link href={url} className={sharedClassName}>
      {label}
    </Link>
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
