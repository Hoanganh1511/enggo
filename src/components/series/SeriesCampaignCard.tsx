import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeriesCardLink } from "./SeriesCardLink";
import type { ContentSeriesAction, ContentSeriesListItem } from "@/lib/api/content-series";

// The "campaign card" - redesign toan bo Series card (yeu cau nguoi dung,
// kem anh mau note.com: anh trai/phai + badge + tieu de/mo ta + CTA + nen
// mau tuy chinh) dung CHUNG cho 2 noi hien thi Series (yeu cau nguoi dung:
// "toàn bộ nơi hiển thị Series"):
// - variant="banner": /series (list page) - da la 1 cot doc san, banner
//   ngang full-width khop tu nhien.
// - variant="compact": NewestSeriesRail.tsx (rail cuon ngang o /home) - giu
//   kich thuoc the hep, mat do day hon (anh nho o tren, toi da 1 CTA).
//
// Tat ca field campaign (badge/anh/nen/CTA...) deu OPTIONAL/co default an
// toan (xem ContentSeriesCardFields) - Series CHUA cau hinh gi van hien hop
// ly (fallback ve hanh vi cu: ca the la 1 link toi /map, khong badge, nen
// surface mac dinh).
const BADGE_VARIANT_CLASS: Record<string, string> = {
  info: "bg-primary-soft text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  deadline: "bg-danger/10 text-danger",
};

function badgeStyle(series: ContentSeriesListItem): { className?: string; style?: React.CSSProperties } {
  if (series.badgeVariant === "custom") {
    return {
      style: {
        backgroundColor: series.badgeColor ?? undefined,
        color: series.badgeTextColor ?? undefined,
      },
    };
  }
  return { className: BADGE_VARIANT_CLASS[series.badgeVariant] ?? BADGE_VARIANT_CLASS.info };
}

// "còn N ngày" / "Đã kết thúc" - tinh THANG tai thoi diem render, KHONG co
// job/cron nao dong bo lai trang thai (ngoai pham vi yeu cau, xem plan).
function deadlineText(deadlineAt: string): string {
  const diffMs = new Date(deadlineAt).getTime() - Date.now();
  if (diffMs <= 0) return "Đã kết thúc";
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return days <= 1 ? "Còn hôm nay" : `Còn ${days} ngày`;
}

function ActionButton({ action, compact }: { action: ContentSeriesAction; compact?: boolean }) {
  const isExternal = /^https?:\/\//.test(action.url);
  const className = cn(
    "inline-flex shrink-0 items-center gap-1 rounded-lg font-medium transition-opacity duration-150 ease-out hover:opacity-85",
    compact ? "text-[12px]" : "text-[13px]",
    action.style === "primary" && (compact ? "bg-ink px-2.5 py-1.5 text-white" : "bg-ink px-4 py-2 text-white"),
    action.style === "secondary" &&
      (compact
        ? "border border-current px-2.5 py-1.5"
        : "border border-current px-4 py-2"),
    action.style === "text" && "underline underline-offset-2",
  );
  const content = (
    <>
      {action.label}
      {action.style === "text" && <ArrowRight size={12} aria-hidden="true" />}
    </>
  );
  if (isExternal) {
    return (
      <a
        href={action.url}
        target={action.openInNewTab ? "_blank" : undefined}
        rel={action.openInNewTab ? "noreferrer" : undefined}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={action.url}
      target={action.openInNewTab ? "_blank" : undefined}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </Link>
  );
}

const CARD_STYLE_CLASS: Record<string, string> = {
  default: "border border-border",
  soft: "border-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  accent: "border-2 border-ink/10",
};

export function SeriesCampaignCard({
  series,
  variant,
}: {
  series: ContentSeriesListItem;
  variant: "compact" | "banner";
}) {
  const hasActions = series.actions.length > 0;
  const cardBg = series.backgroundColor || undefined;
  const isLightBg = series.textTheme === "light";
  const textColorClass = cardBg
    ? isLightBg
      ? "text-white"
      : "text-ink"
    : "text-ink";
  const mutedColorClass = cardBg ? (isLightBg ? "text-white/75" : "text-ink-muted") : "text-ink-muted";

  const image = series.coverImageUrl && (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-surface-muted",
        variant === "compact" ? "h-28 w-full" : "h-full",
      )}
      style={variant === "banner" ? { width: `${series.imageWidthPercent}%` } : undefined}
    >
      <Image
        src={series.coverImageUrl}
        alt=""
        fill
        className={series.imageFit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );

  const badge = series.showBadge && series.badgeText && (
    <span
      className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeStyle(series).className)}
      style={badgeStyle(series).style}
    >
      {series.badgeText}
    </span>
  );
  const deadline = series.showDeadline && series.deadlineAt && (
    <span className={cn("inline-block rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-semibold", textColorClass)}>
      {deadlineText(series.deadlineAt)}
    </span>
  );

  const content = (
    <div className={cn("flex min-w-0 flex-1 flex-col justify-center gap-1.5", variant === "banner" ? "p-4" : "p-3")}>
      {(badge || deadline) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {badge}
          {deadline}
        </div>
      )}
      <p
        className={cn(
          "font-content line-clamp-2 font-bold",
          textColorClass,
          variant === "banner" ? "text-[17px]" : "text-[14px]",
        )}
      >
        {series.title}
      </p>
      {variant === "banner" && (
        <p className={cn("line-clamp-2 text-[13px] leading-snug", mutedColorClass)}>{series.description}</p>
      )}
      {hasActions && (
        <div className={cn("mt-1 flex flex-wrap items-center gap-2", isLightBg && "text-white")}>
          {series.actions.slice(0, variant === "compact" ? 1 : 3).map((action) => (
            <ActionButton key={action.id} action={action} compact={variant === "compact"} />
          ))}
        </div>
      )}
    </div>
  );

  // Huong xep image/content - compact LUON xep DOC (anh tren, noi dung
  // duoi), bo qua imagePosition (khong du cho de dat anh CANH BEN trong 1
  // the hep ~260px, xem comment dau file). banner moi thuc su dung
  // imagePosition left/right.
  const direction =
    variant === "compact"
      ? "flex-col"
      : series.imagePosition === "right"
        ? "flex-row-reverse"
        : "flex-row";

  const cardClassName = cn(
    "flex overflow-hidden rounded-xl transition-colors duration-150 ease-out",
    !cardBg && "bg-surface",
    CARD_STYLE_CLASS[series.cardStyle] ?? CARD_STYLE_CLASS.default,
    !cardBg && "hover:border-border-strong",
    direction,
    variant === "compact" ? "min-w-[260px] max-w-[260px]" : "w-full",
    // min-h-40 (banner) - khong co gia tri nay, chieu cao ca hang CHI dua
    // theo NOI DUNG chu (1-2 dong ngan) - anh (h-full, cung stretch theo
    // chieu cao hang do) bi ep xuong con vai chuc px, gan nhu khong thay
    // (yeu cau nguoi dung: "seri có ảnh bìa rồi nhưng không hiển thị...
    // thấp quá"). compact da co h-28 CO DINH rieng cho anh nen khong can.
    variant === "banner" && "min-h-40",
  );
  const cardStyle: React.CSSProperties = { backgroundColor: cardBg };

  // Khong co action nao cau hinh - CA the la 1 link (hanh vi cu, fallback
  // toi entry "map"). Co action - the la 1 div THUONG (khong bao Link nua,
  // tranh <a> long <a>), tung nut CTA tu dieu huong rieng.
  if (!hasActions) {
    return (
      <SeriesCardLink href={`/series/${series.slug}/map`} className={cardClassName} style={cardStyle}>
        {image}
        {content}
      </SeriesCardLink>
    );
  }

  return (
    <div className={cardClassName} style={cardStyle}>
      {image}
      {content}
    </div>
  );
}
