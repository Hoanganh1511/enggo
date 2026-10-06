import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";
import { SeriesCardLink } from "./SeriesCardLink";
import type { ContentSeriesListItem } from "@/lib/api/content-series";

// [2026-10-06 REDESIGN] "Product card" kieu e-commerce (yeu cau nguoi dung
// kem anh mau: 1 the Amazon affiliate - anh FULL-WIDTH tren cung, tieu de 2
// dong, 1 hang "giá + tác giả", 1 nut CTA FULL-WIDTH, 1 dong chu nho duoi
// cung) - "thiết kế lại card series ở trang home và các nơi hiển thị card
// series thành layout bố cục như ảnh". Dung CHUNG cho CA 2 noi hien thi
// Series (variant khac nhau CHI o KICH THUOC, bo cuc GIONG HET nhau):
// - variant="banner": /series (list page) - SeriesListManager.tsx da doi
//   sang luoi (grid) nhieu cot thay vi 1 cot xep doc nhu truoc, vi the doc
//   hep gio khong con hop ly xep full-width 1 hang/the nua.
// - variant="compact": NewestSeriesRail.tsx (rail cuon ngang o /home) - kich
//   thuoc hep hon, dung trong 1 hang cuon ngang.
//
// So voi ban truoc: BO HAN huong anh trai/phai (imagePosition/imageWidthPercent
// - 2 field nay gio KHONG CON duoc doc o day nua, van con trong kieu du lieu/
// form admin cu nhung khong con tac dung hien thi gi - anh LUON o tren cung,
// full-width, dung ty le, khop dung bo cuc anh mau), BO phan mo ta dai (anh
// mau khong co, chi con tieu de + 1 dong metadata ngan), va GOP nhieu nut CTA
// rieng le THANH 1 nut DUY NHAT full-width (dung action DAU TIEN neu admin co
// cau hinh, mac dinh "Xem series"). CA THE la 1 link DUY NHAT (khong con 2
// nhanh rieng co/khong co actions) - nut CTA chi la 1 <span> trang tri BEN
// TRONG link do, khong phai 1 <a> long nhau nua - don gian hoa dang ke.
const BADGE_VARIANT_CLASS: Record<string, string> = {
  info: "bg-primary-soft text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  deadline: "bg-danger/10 text-danger",
};

function badgeStyle(series: ContentSeriesListItem): {
  className?: string;
  style?: React.CSSProperties;
} {
  if (series.badgeVariant === "custom") {
    return {
      style: {
        backgroundColor: series.badgeColor ?? undefined,
        color: series.badgeTextColor ?? undefined,
      },
    };
  }
  return {
    className: BADGE_VARIANT_CLASS[series.badgeVariant] ?? BADGE_VARIANT_CLASS.info,
  };
}

// "còn N ngày" / "Đã kết thúc" - tinh THANG tai thoi diem render, KHONG co
// job/cron nao dong bo lai trang thai (ngoai pham vi yeu cau, xem plan).
function deadlineText(deadlineAt: string): string {
  const diffMs = new Date(deadlineAt).getTime() - Date.now();
  if (diffMs <= 0) return "Đã kết thúc";
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return days <= 1 ? "Còn hôm nay" : `Còn ${days} ngày`;
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
  const cardBg = series.backgroundColor || undefined;
  const isLightBg = series.textTheme === "light";
  const textColorClass = cardBg ? (isLightBg ? "text-white" : "text-ink") : "text-ink";
  const mutedColorClass = cardBg ? (isLightBg ? "text-white/75" : "text-ink-muted") : "text-ink-muted";

  // Nut CTA DUY NHAT - dung action DAU TIEN neu admin co cau hinh (tu
  // "Thẻ hiển thị" trong SeriesManageTabs.tsx), mac dinh tro ve trang Map
  // cua Series kem nhan "Xem series" khi chua cau hinh gi (hanh vi an toan,
  // giong ban truoc).
  const primaryAction = series.actions[0];
  const href = primaryAction?.url || `/series/${series.slug}/map`;
  const buttonLabel = primaryAction?.label || "Xem series";
  const isExternal = /^https?:\/\//.test(href);

  const image = series.coverImageUrl && (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-surface-muted",
        variant === "compact" ? "aspect-4/3" : "aspect-16/10",
      )}
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
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        badgeStyle(series).className,
      )}
      style={badgeStyle(series).style}
    >
      {series.badgeText}
    </span>
  );
  const deadline = series.showDeadline && series.deadlineAt && (
    <span
      className={cn(
        "inline-block rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-semibold",
        textColorClass,
      )}
    >
      {deadlineText(series.deadlineAt)}
    </span>
  );

  const cardClassName = cn(
    "group flex flex-col overflow-hidden rounded-xl transition-colors duration-150 ease-out",
    !cardBg && "bg-surface",
    CARD_STYLE_CLASS[series.cardStyle] ?? CARD_STYLE_CLASS.default,
    !cardBg && "hover:border-border-strong",
    variant === "compact" ? "min-w-[220px] max-w-[220px]" : "w-full",
  );
  const cardStyle: React.CSSProperties = { backgroundColor: cardBg };

  const body = (
    <>
      {image}
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2", variant === "compact" ? "p-3" : "p-4")}>
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
            variant === "compact" ? "text-[14px]" : "text-[16px]",
          )}
        >
          {series.title}
        </p>
        {/* Hang "giá + tác giả" khop anh mau - vi Series khong co gia that,
            dung "X phần" (so lieu THAT, _count.entries) lam phan nhan manh
            (bold, giong vi tri gia tien) + ten tac gia ben canh (muted). */}
        <p className={cn("flex min-w-0 items-center gap-1.5 text-[12.5px]", mutedColorClass)}>
          <span className={cn("shrink-0 font-bold", textColorClass)}>{series._count.entries} phần</span>
          <span aria-hidden="true" className="shrink-0">
            /
          </span>
          <span className="truncate">{series.authorName}</span>
        </p>
        <span
          className={cn(
            "mt-1 block w-full rounded-lg border py-2 text-center text-[13px] font-semibold transition-colors duration-150 ease-out",
            isLightBg
              ? "border-white/60 text-white group-hover:bg-white group-hover:text-ink"
              : "border-ink text-ink group-hover:bg-ink group-hover:text-white",
          )}
        >
          {buttonLabel}
        </span>
        {/* Dong chu nho cuoi cung khop anh mau ("※2026/09/11 13:32時点") -
            dung THAT updatedAt cua Series (KHONG bia gia tri gia - fake du
            lieu), hien dang "Cập nhật X trước" qua formatRelativeTime() da
            co san (format-time.ts). */}
        <p className={cn("text-[11px]", mutedColorClass)}>Cập nhật {formatRelativeTime(series.updatedAt)}</p>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cardClassName} style={cardStyle}>
        {body}
      </a>
    );
  }
  return (
    <SeriesCardLink href={href} className={cardClassName} style={cardStyle}>
      {body}
    </SeriesCardLink>
  );
}
