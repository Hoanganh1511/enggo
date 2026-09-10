import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";

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

// Anh hero - THIET KE that co 4 anh xoay carousel, hien tai CHI co 1 anh that
// (hero-1-articles-page.png, nguoi dung cung cap - canh ban lam viec canh cua
// so, da co san chu thich "good ideas find people.." NUNG SAN trong chinh
// anh, KHONG can ve them lop text rieng de nua) - 3 anh con lai se bo sung
// sau. Cham dot o duoi VAN hien du 4 (dung UI cuoi cung), nhung CHUA co logic
// xoay/carousel that (chi 1 slide thi khong co gi de xoay) - them
// useState/interval khi co du 4 anh that.
const HERO_SLIDE_COUNT = 4;

// Server Component thuan (khong "use client") - hero + 3 the linh vuc noi
// bat la static, khong can hydrate. Bo cuc 70/30 (hero chiem 70%, cum 3 the
// chiem 30%) theo dung thiet ke tham chieu nguoi dung gui.
export function ArticlesHero({ writeHref }: { writeHref: string }) {
  return (
    <>
      {/* Mobile/tablet (<lg) - dai ngan gon thay vi hero to + 3 feature tile
          (chiem qua nhieu dat theo gop y nguoi dung), chi con 1 dong tagline
          + nut "Viết ngay". Desktop (lg+) giu NGUYEN ban duoi, khong doi. */}
      <section className="relative flex h-16 items-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] sm:h-20 lg:hidden">
        <Image
          src="/assets/images/hero-1-articles-page.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent" />
        <div className="relative z-10 flex w-full items-center justify-between gap-3 px-4">
          <p className="font-content text-[13px] font-semibold text-white sm:text-sm">
            Good ideas find people…
          </p>
          <Link
            href={writeHref}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-semibold text-[var(--foreground)] transition hover:-translate-y-px hover:shadow-md"
          >
            <PenLine size={13} aria-hidden="true" /> Viết ngay
          </Link>
        </div>
      </section>

      <section className="hidden gap-4 xl:grid-cols-[7fr_3fr] lg:grid">
      <div className="relative min-h-[210px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:min-h-[238px]">
        <Image
          src="/assets/images/hero-1-articles-page.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Anh nen sang mau (canh ban ngay gan cua so) - overlay den can DAM
            hon ban truoc (anh nui toi mau) de chu trang van doc duoc, nhung
            fade het truoc ~65% chieu rong de KHONG de len chu thich "good
            ideas find people.." da co san trong anh (nam ben phai). */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 via-40% to-transparent" />

        <div className="relative z-10 flex min-h-[238px] max-w-[520px] flex-col justify-center px-5 py-5 sm:px-7 sm:py-6 md:px-10">
          {/* font-content: tieu de + mo ta la NOI DUNG, dung Manrope - 1 nut
              CTA ben duoi la UI, khong boc. */}
          <h1 className="font-content text-[32px] leading-[1.14] font-bold tracking-[-.03em] text-white md:text-[42px]">
            Viết, là để
            <br />
            sống sâu hơn.
          </h1>
          <p className="font-content mt-4 max-w-[400px] text-sm leading-6 text-white/75">
            Suy nghĩ, tạo ra, và chia sẻ.
            <br />
            Đây là nơi lưu giữ điều bạn học và trao đi điều bạn tin.
          </p>
          <div className="mt-6">
            <Link
              href={writeHref}
              className="flex h-11 w-fit items-center gap-2 rounded-[10px] bg-white px-[18px] text-[14px] font-semibold text-[var(--foreground)] transition hover:-translate-y-px hover:shadow-md"
            >
              <PenLine size={16} aria-hidden="true" /> Bắt đầu viết <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="absolute right-6 bottom-5 flex gap-2">
          {Array.from({ length: HERO_SLIDE_COUNT }, (_, i) => (
            <span
              key={i}
              className={i === 0 ? "h-1.5 w-5 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/50"}
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
