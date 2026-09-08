"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Info, MessageCircle, Sparkle, Star } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import type { HomeFeature } from "@/components/discover/home-features-data";

// The dich vu tren /services - moi dich vu 1 hang full-width (xem
// ServicesShell.tsx), nhuom nen + decor (bong bay mo/luoi cham/sparkle) theo
// accentColor RIENG cua tung dich vu (home-features-data.ts). Ty le/khoang
// cach giu DUNG nhu anh mau nguoi dung dua - KHONG thu nho nhoi vao 1 o luoi
// nhieu cot nhu ban truoc (lam vo bo cuc). Cum 3 nut "Gioi thieu/Gui gam tac
// gia/Feedback" nam RIENG 1 hang ben duoi the (khong nhoi vao trong the) -
// disabled + "Sắp có" vi trang /services/[slug] van la placeholder, chua co
// noi dung/backend that dang sau 3 muc do.
export function ServiceCard({
  service,
  isFavorite,
  onToggleFavorite,
}: {
  service: HomeFeature;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  const Icon = service.icon;
  const accent = service.accentColor;

  const quickLinks = [
    { icon: Info, label: "Giới thiệu về service này" },
    { icon: Heart, label: "Gửi gắm của tác giả" },
    { icon: MessageCircle, label: "Feedback" },
  ];

  return (
    <div>
      <div
        className="relative mx-auto overflow-hidden rounded-[28px] border border-border p-10 sm:p-14"
        style={{ background: hexToRgba(accent, 0.05) }}
      >
        {/* Decor: bong bay mo + luoi cham + sparkle - dam hon nen ~15 diem
            phan tram (nen 5% -> decor 20%), khong che noi dung
            (pointer-events-none). */}
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full blur-2xl"
          style={{ background: hexToRgba(accent, 0.2) }}
        />
        <div
          className="pointer-events-none absolute top-10 right-16 size-24 rounded-full blur-xl"
          style={{ background: hexToRgba(accent, 0.2) }}
        />
        <Sparkle
          size={26}
          className="pointer-events-none absolute top-16 left-[38%]"
          style={{ color: hexToRgba(accent, 0.55) }}
        />
        <div className="pointer-events-none absolute top-8 right-20 grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="size-1 rounded-full"
              style={{ background: hexToRgba(accent, 0.35) }}
            />
          ))}
        </div>

        <button
          type="button"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={() => onToggleFavorite(service.slug)}
          className="absolute top-6 right-6 z-20 cursor-pointer text-ink-faint transition-colors duration-150 ease-out hover:text-amber-500"
        >
          <Star
            size={18}
            strokeWidth={2}
            className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
          />
        </button>

        <Link
          href={`/services/${service.slug}`}
          className="group relative z-10 flex flex-col items-start gap-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col items-start">
            <span
              className="grid size-20 shrink-0 place-items-center rounded-2xl transition-transform duration-150 ease-out group-hover:scale-105"
              style={{ background: accent }}
            >
              <Icon size={38} className="text-white" strokeWidth={2} />
            </span>
            <h3 className="mt-6 text-3xl font-extrabold text-ink">
              {service.title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              {service.description}
            </p>

            <span className="mt-6 flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:border-ink/30">
              Open
              <ArrowUpRight size={14} />
            </span>
          </div>

          {/* Anh minh hoa rieng (neu co) - chua co thi khong hien gi them
              (icon box ben trai da du dai dien, KHONG bia anh gia). */}
          {service.image && (
            <div className="relative h-56 w-full max-w-72 shrink-0 sm:h-64 sm:w-72">
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-contain drop-shadow-xl"
              />
            </div>
          )}
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {quickLinks.map(({ icon: LinkIcon, label }) => (
          <button
            key={label}
            type="button"
            disabled
            title="Sắp có"
            className="flex cursor-not-allowed items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm"
          >
            <span
              className="grid size-6 shrink-0 place-items-center rounded-full text-white"
              style={{ background: accent }}
            >
              <LinkIcon size={13} strokeWidth={2.25} />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
