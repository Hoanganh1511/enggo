"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { cn } from "@/lib/utils";
import { extractQuestionPickerToc } from "@/lib/docs/question-picker-toc";
import { SeriesQuestionPickerToc } from "./SeriesQuestionPickerToc";
import { SeriesEmailSignup } from "./SeriesEmailSignup";
import type {
  EntryBlockButton,
  EntryContentBlock,
  EntryContentBlockZone,
  EntryLessonListItem,
} from "@/lib/api/content-series";

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
  const zoneBlocks = (blocks ?? []).filter(
    (block) => (block.zone ?? "top") === zone,
  );
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
      return (
        <SeriesQuestionPickerToc
          items={extractQuestionPickerToc(contentMarkdown)}
        />
      );
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
    case "lessonList":
      return <LessonListBlock block={block} />;
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
    // -mx-6 lg:-mx-10 CA 2 BEN - dung y het ky thuat full-bleed da giai quyet
    // cho <hr> trong EntryBody (xem comment o do). [2026-09-16] Truoc day CHI
    // bleed TRAI vi <article> khong co padding-right rieng nen ben phai "tu
    // nhien" da chay dung toi border-r roi; gio <article> co THEM pr-6/
    // lg:pr-10 (yeu cau nguoi dung: dung de content sat border-r) nen phai
    // bleed NGUOC lai -mr-6/lg:-mr-10 de khoi nay VAN chay full-width toi
    // border-r nhu cu, khong bi hut ngan lai theo padding moi.
    <div className="font-content -mx-6 rounded-r-xl bg-surface-muted px-6 py-6 lg:-mx-10 lg:px-10">
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
// anh mau tham khao 2 (anh chibi + text + 1 CTA ben phai).
function BotHelpBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "botHelp" }>;
}) {
  //
  return (
    // p-8 (32px 4 huong) - yeu cau nguoi dung: "padding của cả block đấy
    // cho thành 32px 4 hướng hết nhé".
    <div className="font-content flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-8">
      <div className="flex min-w-0 items-center gap-2.5">
        {/* Anh chibi rieng nguoi dung tu them (public/assets/images/), thay
            the icon Bot mac dinh - yeu cau nguoi dung: "dùng thay vào cho
            chỗ ảnh logo bên cạnh cụm thông tin 'Not sure where to start'
            ấy nhé". Size 100x100 (khong con 160x160), KHONG con gap voi
            cum text ben canh - yeu cau nguoi dung dieu chinh lai. */}
        <Image
          src="/assets/images/AI_assistant_image.png"
          alt=""
          width={70}
          height={70}
          className="shrink-0 object-contain"
        />
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-[16.5px] font-semibold text-ink">{block.title}</p>
          <p className="text-[14px] text-ink-muted">{block.description}</p>
        </div>
      </div>
      <EntryPromoButtonLink
        label={block.buttonLabel}
        url={block.buttonUrl}
        event={block.buttonEvent}
        className="shrink-0 bg-accent-gold text-ink hover:opacity-90"
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
        event={block.buttonEvent}
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
        event={block.buttonEvent}
        className="mt-3 bg-accent-gold text-ink hover:opacity-90"
      />
    </div>
  );
}

// Danh sach bai hoc dang the doc ("5 lessons, in order") - yeu cau nguoi
// dung dua tren 1 anh mau tham khao: tieu de chung + nhieu the, moi the anh
// thu nho + so thu tu + tieu de + mo ta 2 dong + nut mui ten tron ben phai.
// Ca the la 1 link/button DUY NHAT (giong SeriesNextEntryBanner) - "nut mui
// ten" chi la trang tri THI GIAC, KHONG phai 1 vung click rieng, tranh 2 lop
// click long nhau tren cung the (khac EntryPageActionsRow noi nut That su
// tach rieng vi con nhieu hanh dong khac tren cung 1 hang).
function LessonListBlock({
  block,
}: {
  block: Extract<EntryContentBlock, { type: "lessonList" }>;
}) {
  if (block.items.length === 0) return null;
  return (
    <div className="font-content flex flex-col gap-3">
      {block.heading && (
        <p className="text-[22px] font-extrabold text-ink">{block.heading}</p>
      )}
      <div className="flex flex-col gap-3">
        {block.items.map((item, index) => (
          <LessonListRow key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function LessonListRow({
  item,
  index,
}: {
  item: EntryLessonListItem;
  index: number;
}) {
  const className =
    "group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-colors duration-150 ease-out hover:border-ink/20";
  const content = (
    <>
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- URL anh go tay, khong qua remotePatterns */}
        <img src={item.imageUrl} alt="" className="size-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[12px] text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="mt-0.5 text-[16px] font-bold text-ink">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-[13.5px] text-ink-muted">
            {item.description}
          </p>
        )}
      </div>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-faint transition-colors duration-150 ease-out group-hover:border-ink group-hover:text-ink">
        <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
      </span>
    </>
  );

  if (item.event) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent(item.event!))}
        className={className}
      >
        {content}
      </button>
    );
  }
  const isExternal = /^https?:\/\//.test(item.url);
  if (isExternal) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={item.url} className={className}>
      {content}
    </Link>
  );
}

function EntryPromoButtonLink({
  label,
  url,
  event,
  className,
}: {
  label: string;
  url: string;
  // Xem comment EntryBlockButton.event trong content-series.ts - co gia tri
  // thi BO QUA url, dispatch 1 CustomEvent tren window thay vi dieu huong.
  event?: string;
  className?: string;
}) {
  const sharedClassName = cn(
    // px-4.5/py-2.5 (khong con px-4/py-2) - yeu cau nguoi dung: "Cho padding
    // cả 2 chiều tăng thêm 2px" (16px->18px ngang, 8px->10px doc).
    "inline-flex w-fit cursor-pointer items-center gap-1 rounded-lg px-4.5 py-2.5 text-[13.5px] font-semibold transition-opacity duration-150 ease-out",
    className,
  );
  if (event) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent(event))}
        className={sharedClassName}
      >
        {label}
      </button>
    );
  }
  const isExternal = /^https?:\/\//.test(url);
  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={sharedClassName}
      >
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
  const className = cn(
    "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg font-medium transition-colors duration-150 ease-out",
    compact ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13.5px]",
    BUTTON_STYLE_CLASS[button.style],
  );

  // Xem comment EntryBlockButton.event trong content-series.ts.
  if (button.event) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent(button.event!))}
        className={className}
      >
        {button.label}
      </button>
    );
  }

  const isExternal = /^https?:\/\//.test(button.url);
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
    <Link
      href={button.url}
      target={button.openInNewTab ? "_blank" : undefined}
      className={className}
    >
      {button.label}
    </Link>
  );
}
