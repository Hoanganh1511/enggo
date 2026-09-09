import Image from "next/image";
import Link from "next/link";
import { GitBranch, PenLine } from "lucide-react";

// Server Component thuan (khong "use client") - toan bo la static (anh/tieu
// de/2 CTA link), khong can hydrate. writeHref da tinh san o page.tsx (server)
// - component nay chi render, khong tu quyet dinh logic dieu huong.
export function HomeHero({ writeHref, workspaceHref }: { writeHref: string; workspaceHref: string }) {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-2xl bg-slate-900 shadow-sm sm:h-[300px] lg:h-[335px]">
      <Image
        src="/assets/images/home-dashboard-hero.png"
        alt="Phong cảnh núi non, minh hoạ hành trình học tập và khám phá"
        fill
        className="object-cover"
        priority
      />
      {/* Lop lam mo anh phia sau chu - backdrop-blur CHI tren lop nay (khong
          phai loc anh goc), mask-image cho blur GIAM DAN tu trai (dam, sau
          chu) sang phai (0 - giu anh net o ria phai, dung y "right side
          slightly more visible" trong brief). */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          WebkitMaskImage: "linear-gradient(to right, black 0%, black 42%, transparent 80%)",
          maskImage: "linear-gradient(to right, black 0%, black 42%, transparent 80%)",
        }}
      />
      {/* Overlay trang dang blob (radial, KHONG phai dai chu nhat cung mep)
          - dam nhat ngay sau chu (28% tu trai), nhat dan mem ra ria, tao cam
          giac chu "noi" tren anh thay vi 1 tam banner phu cung. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 100% at 26% 46%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.78) 38%, rgba(255,255,255,0.32) 62%, rgba(255,255,255,0) 84%)",
        }}
      />
      <div className="relative z-[1] max-w-[590px] px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12">
        {/* font-content: dong gioi thieu/tieu de/mo ta la NOI DUNG, dung
            Manrope - 2 nut CTA ben duoi la UI, khong boc. */}
        <div className="font-content mb-3 text-[14px] text-slate-600">
          A personal knowledge platform
        </div>
        <h1 className="font-content text-[26px] leading-[1.1] font-bold tracking-[-.02em] sm:text-[32px] sm:tracking-[-1.2px] lg:text-[38px] lg:tracking-[-1.8px]">
          Write. Learn. Build. Grow.
        </h1>
        <p className="font-content mt-4 max-w-[500px] text-[15px] leading-6 text-slate-600">
          Notes, articles, roadmaps, and more — one place to capture what I learn and share what
          matters.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <Link
            href={writeHref}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#162033] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black sm:w-auto"
          >
            <PenLine size={16} aria-hidden="true" />
            Start Writing
          </Link>
          <Link
            href={workspaceHref}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 sm:w-auto"
          >
            <GitBranch size={16} aria-hidden="true" />
            Explore Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
