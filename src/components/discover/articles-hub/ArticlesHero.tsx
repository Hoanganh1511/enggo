"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

// 3 anh nguoi dung cung cap (feature-ai/work/life.jpg) CHI dung lam LOP ANH
// NEN - tieu de/mo ta la 1 lop RIENG do chinh component nay ve (khong dung
// chu Nhat nung san trong anh), dung tinh than "tach lop nen/lop noi dung"
// theo yeu cau nguoi dung. 3 anh nay mang tinh CHU DE co dinh (AI/cong viec/
// doi song), khong gan voi featuredGroups (du lieu that hay doi) - vi vay
// CHI co title/sub tinh (bien tap), KHONG bia so lieu (bai viet/luot xem)
// di kem vi khong co nguon that nao dung sau 3 tieu de nay.
const FEATURE_TILES = [
  {
    image: "/assets/images/articles-hub/feature-ai.jpg",
    title: "AI & Sáng tạo",
    sub: "Xây dựng · Thử nghiệm · Chia sẻ",
    className: "col-span-2",
  },
  {
    image: "/assets/images/articles-hub/feature-work.jpg",
    title: "Bí quyết công việc",
    sub: "Làm việc vui hơn mỗi ngày",
  },
  {
    image: "/assets/images/articles-hub/feature-life.jpg",
    title: "Hạnh phúc đời thường",
    sub: "Ảnh · Tản văn · Suy nghĩ",
  },
];

// 4 slide xoay gioi thieu TINH NANG THAT cua app (khac FEATURE_TILES o tren -
// do la chu de NOI DUNG, day la TINH NANG SAN PHAM) - thay cho 1 hero tinh
// chi co "Viết ngay" truoc day. Slide 1 giu NGUYEN anh+chu cu (hero-1-articles-page.png
// da co san chu thich "good ideas find people.." nung trong anh, khong doi
// de khong mat dong chu that dep do) - 3 slide sau tai dung anh cua
// FEATURE_TILES lam nen (da la anh trang tri, khong gan noi dung cu the nen
// dung lai duoc) kem tieu de/mo ta MOI ve tinh nang, moi slide 1 CTA rieng
// dan thang toi trang tinh nang do (khac ban cu, moi slide deu la "Viết ngay").
const HERO_SLIDES = [
  {
    image: "/assets/images/hero-1-articles-page.png",
    tagline: "Good ideas find people…",
    title: (
      <>
        Viết, là để
        <br />
        sống sâu hơn.
      </>
    ),
    description: (
      <>
        Suy nghĩ, tạo ra, và chia sẻ.
        <br />
        Đây là nơi lưu giữ điều bạn học và trao đi điều bạn tin.
      </>
    ),
    ctaLabel: "Bắt đầu viết",
    ctaIcon: PenLine,
    getHref: (writeHref: string) => writeHref,
  },
  {
    image: "/assets/images/articles-hub/feature-ai.jpg",
    tagline: "AI đồng hành khi bạn viết",
    title: (
      <>
        Chưa biết viết gì?
        <br />
        Để AI gợi ý cùng bạn.
      </>
    ),
    description: (
      <>
        Gợi ý ý tưởng, chỉnh câu chữ, tóm tắt nội dung.
        <br />
        Ngay trong lúc soạn bài, không cần rời trang.
      </>
    ),
    ctaLabel: "Thử viết với AI",
    ctaIcon: ArrowRight,
    getHref: (writeHref: string) => writeHref,
  },
  {
    image: "/assets/images/articles-hub/feature-work.jpg",
    tagline: "Bộ sưu tập của riêng bạn",
    title: (
      <>
        Gom lại những gì
        <br />
        đáng đọc lại.
      </>
    ),
    description: (
      <>
        Lưu bài viết vào bộ sưu tập theo chủ đề bạn tự đặt.
        <br />
        Công khai để chia sẻ, hoặc riêng tư cho chính mình.
      </>
    ),
    ctaLabel: "Khám phá bộ sưu tập",
    ctaIcon: ArrowRight,
    getHref: () => "/collections",
  },
  {
    image: "/assets/images/articles-hub/feature-life.jpg",
    tagline: "Theo dõi hành trình mỗi ngày",
    title: (
      <>
        Tiến độ, mục tiêu,
        <br />
        năng lượng — 1 nơi.
      </>
    ),
    description: (
      <>
        Ghi lại việc đã làm, mục tiêu đang theo đuổi.
        <br />
        Nhìn lại chặng đường của chính mình bất cứ lúc nào.
      </>
    ),
    ctaLabel: "Xem trang theo dõi",
    ctaIcon: ArrowRight,
    getHref: () => "/tracking",
  },
];

const SLIDE_INTERVAL_MS = 6000;

// "use client" (khac ban cu, tung la Server Component thuan) - carousel THAT
// can useState (slide dang hien) + useEffect (tu chuyen slide dinh ky). 3 the
// linh vuc noi bat (FEATURE_TILES) VAN tinh, khong doi.
export function ArticlesHero({ writeHref }: { writeHref: string }) {
  const [active, setActive] = useState(0);
  const slide = HERO_SLIDES[active];
  const CtaIcon = slide.ctaIcon;

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Mobile/tablet (<lg) - CAO HON HAN ban truoc (h-16/h-20 -> h-48/h-56)
          de thay ro anh nen tung slide, khong chi 1 dai mong bi gradient che
          gan het. BO nut rieng (truoc day hardcode "Viết ngay" + PenLine cho
          MOI slide, sai/gay nham voi 3 slide con lai von la AI/Bo suu tap/
          Theo doi, khong phai viet bai) - ca THE la 1 <Link> lon, bam dau
          cung dieu huong dung toi trang tinh nang cua slide do (giu nguyen
          slide.getHref), khong mat kha nang bam nhu ban button nho truoc. */}
      <Link
        href={slide.getHref(writeHref)}
        className="relative flex h-48 items-end overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] sm:h-56 lg:hidden"
      >
        <Image
          key={slide.image}
          src={slide.image}
          alt=""
          fill
          className="object-cover transition-opacity duration-500"
        />
        {/* Gradient tu DUOI len (khac ban cu trai-phai) - khop voi chu gio
            dat o day (bottom-aligned), giong dung kieu FEATURE_TILES ben duoi. */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 via-55% to-transparent" />
        <div key={active} className="animate-hero-slide-in font-content relative z-10 w-full px-5 pb-5">
          <p className="line-clamp-2 text-[16px] leading-snug font-semibold text-white">
            {slide.tagline}
          </p>
          {/* Cham dot - them cho mobile (truoc chi co o ban desktop) de bao
              "dang xoay nhieu slide" ro rang hon khi da bo nut. */}
          <div className="mt-3 flex gap-1.5">
            {HERO_SLIDES.map((s, i) => (
              <span
                key={s.image}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === active ? "w-5 bg-white" : "w-1 bg-white/50",
                )}
              />
            ))}
          </div>
        </div>
      </Link>

      <section className="hidden gap-4 xl:grid-cols-[7fr_3fr] lg:grid">
      <div className="relative min-h-[210px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:min-h-[238px]">
        <Image
          key={slide.image}
          src={slide.image}
          alt=""
          fill
          className="object-cover transition-opacity duration-500"
          priority
        />
        {/* Anh nen sang mau (canh ban ngay gan cua so) - overlay den can DAM
            hon ban truoc (anh nui toi mau) de chu trang van doc duoc, nhung
            fade het truoc ~65% chieu rong de KHONG de len chu thich "good
            ideas find people.." da co san trong anh slide 1 (nam ben phai). */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 via-40% to-transparent" />

        <div
          key={active}
          className="animate-hero-slide-in relative z-10 flex min-h-[238px] max-w-[520px] flex-col justify-center px-5 py-5 sm:px-7 sm:py-6 md:px-10"
        >
          {/* font-content: tieu de + mo ta la NOI DUNG, dung Manrope - 1 nut
              CTA ben duoi la UI, khong boc. */}
          <h1 className="font-content text-[32px] leading-[1.14] font-bold tracking-[-.03em] text-white md:text-[42px]">
            {slide.title}
          </h1>
          <p className="font-content mt-4 max-w-[400px] text-sm leading-6 text-white/75">
            {slide.description}
          </p>
          <div className="mt-6">
            <Link
              href={slide.getHref(writeHref)}
              className="flex h-11 w-fit items-center gap-2 rounded-[10px] bg-white px-[18px] text-[14px] font-semibold text-[var(--foreground)] transition hover:-translate-y-px hover:shadow-md"
            >
              <CtaIcon size={16} aria-hidden="true" /> {slide.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="absolute right-6 bottom-5 flex gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Xem slide ${i + 1}`}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                i === active ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75",
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-3 sm:min-h-[210px] sm:grid-cols-2 sm:grid-rows-2 sm:gap-4 md:min-h-[238px]">
        {FEATURE_TILES.map((tile) => (
          <div
            key={tile.image}
            className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-transform duration-200 ease-out hover:-translate-y-0.5 ${tile.className ?? ""}`}
          >
            {/* Lop 1: anh nen thuan tuy. */}
            <Image
              src={tile.image}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.015]"
            />
            {/* Lop 2: gradient toi tu duoi len, chi de chu (lop 3) doc duoc -
                KHONG phu ca tile (giu anh sang ro o phia tren). */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 via-55% to-transparent" />
            {/* Lop 3: noi dung chu THAT (khong phai chu nung san trong anh). */}
            <div className="font-content absolute inset-x-0 bottom-0 z-10 p-5 text-white">
              <h2 className="text-[16px] font-bold tracking-[-.02em]">{tile.title}</h2>
              <p className="mt-1 text-[11px] text-white/80">{tile.sub}</p>
            </div>
          </div>
        ))}
      </div>
      </section>
    </>
  );
}
