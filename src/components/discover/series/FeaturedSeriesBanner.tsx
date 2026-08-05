import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Target,
  HeartHandshake,
  TrendingUp,
  Trophy,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SERIES_ACCENT, SERIES_BANNER_GRADIENT } from "./series-style";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: "Cộng đồng chất lượng",
    description: "Học cùng những người cùng mục tiêu",
  },
  {
    icon: Target,
    title: "Lộ trình rõ ràng",
    description: "Học có kế hoạch, đo lường tiến độ",
  },
  {
    icon: HeartHandshake,
    title: "Hỗ trợ tận tâm",
    description: "Mentor & members luôn đồng hành",
  },
];

const MEMBER_AVATARS = [
  "https://i.pravatar.cc/64?u=banner-member-1",
  "https://i.pravatar.cc/64?u=banner-member-2",
  "https://i.pravatar.cc/64?u=banner-member-3",
];

// Badge lo lung "tua" tren duong leo nui - moi badge co 1 CHAM DANH DAU tren
// duong di, noi voi badge (icon + tieu de + mo ta ngan) bang 1 duong ke net
// dut, gan dung theo vi tri quan sat duoc trong public/mountain-banner.png
// (toa do la GAN DUNG, anh tinh khong co du lieu toa do that).
const FLOATING_BADGES: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  top: string;
  lineWidth: number;
}[] = [
  {
    icon: Trophy,
    title: "Đạt mục tiêu",
    subtitle: "Chinh phục đỉnh cao",
    top: "16%",
    lineWidth: 32,
  },
  {
    icon: HeartHandshake,
    title: "Hỗ trợ nhau",
    subtitle: "Cùng nhau vượt qua",
    top: "38%",
    lineWidth: 44,
  },
  {
    icon: TrendingUp,
    title: "Tiến bộ mỗi ngày",
    subtitle: "Tích lũy mỗi bước nhỏ",
    top: "58%",
    lineWidth: 24,
  },
  {
    icon: Users,
    title: "Học cùng nhau",
    subtitle: "Bắt đầu hành trình",
    top: "78%",
    lineWidth: 40,
  },
];

// Banner dau trang "Đi cùng mọi người" - public/cloud-banner.png lam nen
// FULL-BLEED (object-cover, tran ca banner, khong con gioi han 85% chieu
// cao + mask nhu ban truoc) vi day gio la 1 canh hoan chinh (nui + may + mat
// troi + chim), khong phai hoa tiet phu. public/mountain-banner.png (nguoi
// leo nui, nen trong suot) chong len tren nhu 1 lop rieng, khop voi canh nen
// phia duoi.
//
// Chu luon nam BEN TRAI, gioi han max-w-xl - lop "scrim" trang mo dan tu
// trai sang phai dam bao chu luon doc duoc du noi dung anh nen the nao,
// khong phu thuoc vao do sang/toi cua tung vung anh.
export function FeaturedSeriesBanner() {
  return (
    <section
      className="relative flex min-h-[34rem] items-center overflow-hidden rounded-xl border border-border p-6 sm:p-10"
      style={{ background: SERIES_BANNER_GRADIENT }}
    >
      <Image
        src="/cloud-banner.png"
        alt=""
        fill
        sizes="1100px"
        priority
        className="object-cover"
      />
      <Image
        src="/mountain-banner.png"
        alt=""
        fill
        sizes="1100px"
        className="object-contain object-right"
      />
      {/* Scrim trang mo dan trai -> phai, dam bao chu (nam ben trai) luon
          doc duoc bat ke noi dung/do sang cua anh nen. */}
      <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/40 to-transparent" />

      {FLOATING_BADGES.map(({ icon: Icon, title, subtitle, top, lineWidth }) => (
        <div
          key={title}
          className="absolute right-4 z-10 flex items-center gap-2 sm:right-8"
          style={{ top }}
        >
          <span
            className="hidden shrink-0 border-t border-dashed sm:block"
            style={{ width: lineWidth, borderColor: SERIES_ACCENT }}
          />
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pr-3.5 pl-1.5 shadow-md">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: SERIES_ACCENT }}
            >
              <Icon size={13} strokeWidth={2.25} />
            </span>
            <span className="flex flex-col">
              <span className="text-xs leading-tight font-semibold text-ink">
                {title}
              </span>
              <span className="text-[10px] leading-tight text-ink-faint">
                {subtitle}
              </span>
            </span>
          </span>
        </div>
      ))}

      <div className="relative z-10 flex max-w-xl flex-col gap-5">
        <span
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
          style={{ color: SERIES_ACCENT }}
        >
          <Users size={14} strokeWidth={2.25} />
          Cộng đồng học tập
        </span>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl leading-tight font-bold tracking-tight text-ink sm:text-4xl">
            Không ai giỏi một mình.
          </h2>
          <h2
            className="text-2xl leading-tight font-bold tracking-tight sm:text-4xl"
            style={{ color: SERIES_ACCENT }}
          >
            Cùng nhau, chúng ta đi xa hơn.
          </h2>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          Tham gia cộng đồng học tập được thiết kế theo lộ trình rõ ràng,
          nhận tài liệu độc quyền, hỗ trợ 1-1 và cùng nhau chinh phục mục
          tiêu.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface/85 p-3 backdrop-blur-sm"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white"
                style={{ color: SERIES_ACCENT }}
              >
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">
                  {title}
                </span>
                <span className="line-clamp-1 block text-xs text-ink-faint">
                  {description}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Neo xuong luoi "Series dang mo" ben duoi (id dat o page.tsx) -
              trang nay da la "tat ca series" nen CTA chi can cuon xuong,
              khong dieu huong sang trang khac. */}
          <Link
            href="#series-sections"
            className="flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
            style={{ background: SERIES_ACCENT }}
          >
            <ArrowRight size={16} strokeWidth={2.25} />
            Khám phá cộng đồng
          </Link>
          <Link
            href="#series-sections"
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface/85 px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur-sm transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <Users size={16} strokeWidth={2.25} />
            Tìm nhóm phù hợp
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex shrink-0 -space-x-2">
            {MEMBER_AVATARS.map((url, i) => (
              <Image
                key={i}
                src={url}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full border-2 border-surface object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-ink">
            <span className="font-semibold" style={{ color: SERIES_ACCENT }}>
              10.000+
            </span>{" "}
            thành viên đang cùng nhau tiến bộ mỗi ngày.
          </p>
        </div>
      </div>
    </section>
  );
}
