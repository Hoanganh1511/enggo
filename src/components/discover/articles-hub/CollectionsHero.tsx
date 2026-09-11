import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Hero trang /collections ("Bộ sưu tập của mọi người") - tai dung DUNG anh
// nui hoang hon da co san (home-dashboard-hero.png, dung trong HomeHero.tsx
// o /articles sau khi doi cho route) khop dung mockup nguoi dung gui, khong
// can them anh moi. Khac ArticlesHero.tsx - KHONG co nut CTA (mockup khong
// co), chi tieu de + mo ta.
export function CollectionsHero() {
  return (
    <div>
      {/* Quay lai /home (khong phai /articles nua) - /articles da khoa hoan
          toan (redirect voi MOI tai khoan, xem articles/layout.tsx), tro ve
          do se chi bi bounce tiep sang /home nen tro thang luon cho gon. */}
      <Link
        href="/home"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors duration-150 ease-out hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Quay lại
      </Link>

      <div className="relative min-h-[210px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] md:min-h-[238px]">
        <Image
          src="/assets/images/home-dashboard-hero.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 via-45% to-transparent" />
        <div className="relative z-10 flex min-h-[238px] max-w-[560px] flex-col justify-center px-5 py-5 sm:px-7 sm:py-6 md:px-10">
          <h1 className="font-content text-[28px] leading-[1.16] font-bold tracking-[-.03em] text-white md:text-[36px]">
            Bộ sưu tập của mọi người
          </h1>
          <p className="font-content mt-3 max-w-[440px] text-sm leading-6 text-white/80">
            Khám phá những bộ sưu tập thú vị từ cộng đồng.
            <br />
            Theo dõi chủ đề bạn quan tâm, lưu lại và cập nhật những nội dung
            mới nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
