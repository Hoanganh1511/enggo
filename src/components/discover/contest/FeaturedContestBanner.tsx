import Link from "next/link";
import { Trophy, Gift, Sparkles, CalendarDays, ArrowRight } from "lucide-react";

import type { Contest } from "@/lib/api/contests";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import { CONTEST_ACCENT, formatDeadline } from "./contest-style";

// Banner "Cuoc thi noi bat" o dau trang /contest, ngay duoi header - dan
// nguoi dung vao 1 cuoc thi cu the thay vi phai tu cuon qua het luoi. Khong
// co asset anh minh hoa that (cup + hop qua + confetti nhu thiet ke tham
// khao) nen phan minh hoa CHI la Lucide icon dat lam hoa tiet nen (absolute,
// mo dan bang opacity) tren nen gradient theo CONTEST_ACCENT - dung dung ky
// thuat ContentTile.tsx dang lam cho truong hop khong co anh that (accent ->
// linear-gradient + icon), giu dong bo voi phan con lai cua app thay vi co
// gang ve lai chinh xac minh hoa tham khao.
export function FeaturedContestBanner({ contest }: { contest: Contest }) {
  return (
    <section
      className="relative grid grid-cols-1 gap-6 overflow-hidden rounded-xl border border-border p-6 sm:grid-cols-[1.2fr_1fr] sm:items-center sm:p-8"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(CONTEST_ACCENT, 0.12)}, ${hexToRgba(CONTEST_ACCENT, 0.03)})`,
      }}
    >
      {/* Hoa tiet nen - thuan trang tri, khong anh huong layout (absolute,
          pointer-events-none), an tren man hep de khong de len chu. */}
      <Trophy
        size={140}
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-6 left-[38%] hidden opacity-[0.07] sm:block"
        style={{ color: CONTEST_ACCENT }}
      />
      <Gift
        size={44}
        strokeWidth={1.25}
        className="pointer-events-none absolute top-6 right-[30%] hidden opacity-10 sm:block"
        style={{ color: CONTEST_ACCENT }}
      />
      <Sparkles
        size={30}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-[26%] bottom-10 hidden opacity-10 sm:block"
        style={{ color: CONTEST_ACCENT }}
      />

      <div className="relative z-10 flex flex-col justify-center gap-3">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: hexToRgba(CONTEST_ACCENT, 0.14),
            color: CONTEST_ACCENT,
          }}
        >
          <Sparkles size={13} strokeWidth={2.25} />
          Gợi ý tham gia
        </span>
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-ink">
          Tham gia cuộc thi nổi bật
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          Chia sẻ ý tưởng, kiến thức, trải nghiệm của bạn và giành thưởng hấp
          dẫn.
        </p>
        {/* Neo den danh sach cuoc thi ben duoi (id dat o page.tsx, boc quanh
            cac STATUS_SECTIONS) - trang nay da la "tat ca cuoc thi" nen CTA
            chi can cuon xuong, khong dieu huong sang trang khac. */}
        <Link
          href="#contest-sections"
          className="mt-1 flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          style={{ background: CONTEST_ACCENT }}
        >
          Xem tất cả cuộc thi
          <ArrowRight size={15} strokeWidth={2.25} />
        </Link>
      </div>

      <Link
        href={`/contest/${contest.slug}`}
        className="relative z-10 flex flex-col gap-3 rounded-lg border bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.1)] transition-colors duration-150 ease-out hover:bg-hover-bg sm:justify-self-end"
        style={{ borderColor: CONTEST_ACCENT }}
      >
        <span
          className="inline-flex w-fit items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: CONTEST_ACCENT }}
        >
          <Trophy size={10} strokeWidth={2.5} />
          CUỘC THI NỔI BẬT
        </span>

        <div className="flex flex-col gap-1">
          <h3
            className="text-base leading-snug font-bold"
            style={{ color: CONTEST_ACCENT }}
          >
            #{contest.hashtag}
          </h3>
          {contest.partnerName && (
            <p className="text-xs text-ink-muted italic">
              với {contest.partnerName}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {contest.prize && (
            <p className="flex items-start gap-1.5 text-xs text-ink-muted">
              <Trophy
                size={12}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-warning"
              />
              <span className="line-clamp-2">{contest.prize}</span>
            </p>
          )}
          {contest.deadline && (
            <p className="flex items-center gap-1.5 text-xs text-ink-faint">
              <CalendarDays size={12} strokeWidth={2} className="shrink-0" />
              Đến hết ngày {formatDeadline(contest.deadline)}
            </p>
          )}
        </div>

        <span
          className="flex items-center gap-1 text-sm font-semibold"
          style={{ color: CONTEST_ACCENT }}
        >
          Xem chi tiết
          <ArrowRight size={14} strokeWidth={2.25} />
        </span>
      </Link>
    </section>
  );
}
