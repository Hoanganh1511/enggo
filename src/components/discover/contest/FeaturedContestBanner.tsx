import Image from "next/image";
import Link from "next/link";
import { Trophy, Sparkles, CalendarDays, ArrowRight } from "lucide-react";

import type { Contest } from "@/lib/api/contests";
import { CONTEST_ACCENT, formatDeadline } from "./contest-style";

// Banner "Cuoc thi noi bat" o dau trang /contest, ngay duoi header - dan
// nguoi dung vao 1 cuoc thi cu the thay vi phai tu cuon qua het luoi. Nen la
// anh that (public/cover-image-1.png, khong phai gradient+icon nhu ban truoc
// - da co anh that nen bo luon hoa tiet icon trang tri, tranh chong chat 2
// lop trang tri). Phu 1 lop gradient toi ben tren anh de chu ben trai (mau
// trang) van doc duoc du anh sang toi khac nhau, KHONG phu thuoc vao noi
// dung/do sang cua tam anh cu the.
export function FeaturedContestBanner({ contest }: { contest: Contest }) {
  return (
    <section className="relative grid grid-cols-1 gap-6 overflow-hidden  border border-border p-6 sm:grid-cols-[1.2fr_1fr] sm:items-center sm:p-8">
      <Image
        src="/cover-image-3.png"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 900px"
        priority
        className="object-cover"
      />
      {/* Lop toi phu tren anh - dam ben trai (noi dat chu) va nhat dan sang
          phai (noi la the trang) de ca chu trang lan the noi bat deu doc
          duoc, khong phu thuoc anh sang/toi cua chinh tam anh. */}
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/20 to-black/5" />

      <div className="relative z-10 flex flex-col justify-center gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Sparkles size={13} strokeWidth={2.25} />
          Gợi ý tham gia
        </span>
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-white">
          Tham gia cuộc thi nổi bật
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-white/85">
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
