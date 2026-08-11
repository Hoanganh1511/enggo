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
import { formatCompact } from "@/lib/format-number";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: "Cộng đồng chất lượng",
    description: "Học cùng những người cùng mục tiêu",
  },
  {
    icon: Target,
    title: "Mục tiêu rõ ràng",
    description: "Trao đổi có định hướng, cùng nhau tiến bộ",
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

// Banner dau trang "Đi cùng mọi người" (port lai tu FeaturedSeriesBanner.tsx
// cu cua Series - noi dung 100% trang tri/tinh, khong phu thuoc du lieu Series
// nao ca, nen giu nguyen duoc toan bo phan giao dien khi chuyen sang Community).
// Dung chung mau --community-accent (#7c3aed) voi toan bo tinh nang Community
// khac (workspace/channel/post...) thay vi hang so SERIES_ACCENT rieng truoc
// day - 2 gia tri von da giong het nhau, gop lai cho dong nhat 1 nguon.
//
// public/cloud-banner.png lam nen FULL-BLEED (object-cover). public/mountain-banner.png
// (nguoi leo nui, nen trong suot) chong len tren nhu 1 lop rieng.
export function CommunityHeroBanner({
  totalMembers,
  compact = false,
}: {
  // Tong so thanh vien THAT (cong don tu danh sach communities that trong
  // DB) - do trang page.tsx truyen vao, khong con la "10.000+" bia san.
  totalMembers: number;
  // Ban thu gon - dung khi banner nam KEP GIUA 2 nua cua luoi Campus 3D
  // (xem page.tsx) thay vi dung rieng tren dau trang. An FLOATING_BADGES,
  // mo ta dai va nut phu vi khong du cao; giu nguyen anh nen + gradient de
  // van nhan ra dung 1 banner, chi la ban "nen" hon.
  compact?: boolean;
}) {
  return (
    <section
      className={`relative flex items-center overflow-hidden rounded-xl border border-border ${
        compact ? "min-h-48 p-5 sm:p-6" : "min-h-136 p-6 sm:p-10"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #ede9fe 0%, #fdf2f8 55%, #eff6ff 100%)",
      }}
    >
      <Image
        src="/cloud-banner.png"
        alt=""
        fill
        sizes="1100px"
        priority={!compact}
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

      {!compact &&
        FLOATING_BADGES.map(
          ({ icon: Icon, title, subtitle, top, lineWidth }) => (
            <div
              key={title}
              className="absolute right-4 z-10 flex items-center gap-2 sm:right-8"
              style={{ top }}
            >
              <span
                className="hidden shrink-0 border-t border-dashed border-community-accent sm:block"
                style={{ width: lineWidth }}
              />
              <span className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pr-3.5 pl-1.5 shadow-md">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-community-accent text-white">
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
          ),
        )}

      <div
        className={`relative z-10 flex flex-col ${compact ? "max-w-md gap-3" : "max-w-xl gap-5"}`}
      >
        <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold tracking-wide text-community-accent uppercase">
          <Users size={14} strokeWidth={2.25} />
          Cộng đồng học tập
        </span>

        <div className="flex flex-col gap-1">
          <h2
            className={`leading-tight font-bold tracking-tight text-ink ${compact ? "text-lg sm:text-xl" : "text-2xl sm:text-4xl"}`}
          >
            Không ai giỏi một mình.
          </h2>
          <h2
            className={`leading-tight font-bold tracking-tight text-community-accent ${compact ? "text-lg sm:text-xl" : "text-2xl sm:text-4xl"}`}
          >
            Cùng nhau, chúng ta đi xa hơn.
          </h2>
        </div>

        {!compact && (
          <p className="max-w-md text-sm leading-relaxed text-ink-muted">
            Tham gia cộng đồng học tập cùng những người có chung mục tiêu,
            nhận tài liệu độc quyền, hỗ trợ từ mentor và cùng nhau tiến bộ mỗi
            ngày.
          </p>
        )}

        {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface/85 p-3 backdrop-blur-sm"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-community-accent">
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
        </div> */}

        <div className="flex flex-wrap items-center gap-3">
          {/* Neo xuong luoi community ben duoi (id dat o page.tsx) - trang
              nay da la "tat ca community" nen CTA chi can cuon xuong. */}
          <Link
            href="#communities-grid"
            className={`flex items-center gap-1.5 rounded-md bg-community-accent font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"}`}
          >
            <ArrowRight size={compact ? 14 : 16} strokeWidth={2.25} />
            Khám phá cộng đồng
          </Link>
          {!compact && (
            <Link
              href="#communities-grid"
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface/85 px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur-sm transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <Users size={16} strokeWidth={2.25} />
              Tìm nhóm phù hợp
            </Link>
          )}
        </div>

        {!compact && (
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
              <span className="font-semibold text-community-accent">
                {formatCompact(totalMembers)}
              </span>{" "}
              thành viên đang cùng nhau tiến bộ mỗi ngày.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
