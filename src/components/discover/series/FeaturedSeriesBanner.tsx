import Link from "next/link";
import { Compass, Users, MessageCircle, Sparkles, ArrowRight } from "lucide-react";

import type { Series } from "@/content/series-mock";
import {
  estimateDiscussionCount,
  estimateDocumentCount,
} from "@/content/community-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import { formatCompact } from "@/lib/format-number";
import { ProgressBar } from "@/components/ui/progress-bar";

// Banner "Series noi bat" o dau trang "Đi cùng mọi người", ngay duoi header -
// dung CHUNG cau truc/ky thuat voi FeaturedContestBanner.tsx (contest-style)
// de dong bo cam giac giua cac trang danh sach (gradient theo accent + hoa
// tiet icon mo, ben trai la loi moi + CTA cuon xuong, ben phai la 1 the noi
// bat cu the). Khac contest (1 mau CONTEST_ACCENT co dinh cho ca domain),
// series MOI series da co accent RIENG san (xem series-mock.ts) nen dung
// thang accent cua chinh series duoc chon lam noi bat, khong bia mau chung.
export function FeaturedSeriesBanner({ series }: { series: Series }) {
  const discussionCount = estimateDiscussionCount(series);
  const documentCount = estimateDocumentCount(series);

  return (
    <section
      className="relative grid grid-cols-1 gap-6 overflow-hidden rounded-xl border border-border p-6 sm:grid-cols-[1.2fr_1fr] sm:items-center sm:p-8"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(series.accent, 0.12)}, ${hexToRgba(series.accent, 0.03)})`,
      }}
    >
      {/* Hoa tiet nen - thuan trang tri, khong anh huong layout (absolute,
          pointer-events-none), an tren man hep de khong de len chu. */}
      <Compass
        size={140}
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-6 left-[38%] hidden opacity-[0.07] sm:block"
        style={{ color: series.accent }}
      />
      <Sparkles
        size={30}
        strokeWidth={1.5}
        className="pointer-events-none absolute top-6 right-[28%] hidden opacity-10 sm:block"
        style={{ color: series.accent }}
      />

      <div className="relative z-10 flex flex-col justify-center gap-3">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: hexToRgba(series.accent, 0.14),
            color: series.accent,
          }}
        >
          <Sparkles size={13} strokeWidth={2.25} />
          Gợi ý tham gia
        </span>
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-ink">
          Series nổi bật
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          Cùng hàng nghìn người khác đi theo 1 lộ trình học có kế hoạch rõ
          ràng, thay vì tự học một mình.
        </p>
        {/* Neo xuong luoi "Series dang mo" ben duoi - trang nay da la "tat ca
            series" nen CTA chi can cuon xuong, khong dieu huong sang trang
            khac. */}
        <Link
          href="#series-sections"
          className="mt-1 flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          style={{ background: series.accent }}
        >
          Xem tất cả series
          <ArrowRight size={15} strokeWidth={2.25} />
        </Link>
      </div>

      <Link
        href={`/community/${series.slug}`}
        className="relative z-10 flex flex-col gap-3 rounded-lg border bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.1)] transition-colors duration-150 ease-out hover:bg-hover-bg sm:justify-self-end"
        style={{ borderColor: series.accent }}
      >
        <span
          className="inline-flex w-fit items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: series.accent }}
        >
          <Compass size={10} strokeWidth={2.5} />
          SERIES NỔI BẬT
        </span>

        <h3 className="line-clamp-2 text-base leading-snug font-bold text-ink">
          {series.title}
        </h3>

        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Users size={12} strokeWidth={2} className="shrink-0" />
            {formatCompact(series.memberCount)} thành viên
          </p>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <MessageCircle size={12} strokeWidth={2} className="shrink-0" />
            {formatCompact(discussionCount)} cuộc thảo luận · {formatCompact(documentCount)} tài liệu
          </p>
          <ProgressBar percent={series.progressPercent} />
        </div>

        <span
          className="flex items-center gap-1 text-sm font-semibold"
          style={{ color: series.accent }}
        >
          Xem chi tiết
          <ArrowRight size={14} strokeWidth={2.25} />
        </span>
      </Link>
    </section>
  );
}
