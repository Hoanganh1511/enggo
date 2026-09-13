import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { ContentSeriesListItem } from "@/lib/api/content-series";
import { ScrollableRow } from "./ScrollableRow";

// "Series mới nhất" tren /home - thiet ke theo mau "注目キーワード" (Yahoo
// Japan trending rail) nguoi dung gui: the co thumbnail dang mosaic (khong
// phai 1 anh don, Series khong co cover image that) + tieu de dam + so lieu
// nho kem icon + mo ta 2 dong. Mosaic lay TOI DA 4 icon emoji cua 4 entry
// dau tien (da sap orderIndex tu backend) lam "anh dai dien" truc quan cho
// Series - fallback ve khoi gradient + icon BookOpen khi Series chua co
// entry nao dat icon.
export function NewestSeriesRail({ series }: { series: ContentSeriesListItem[] }) {
  if (series.length === 0) {
    return (
      <p className="py-4 text-[13px] text-[var(--muted)]">
        Chưa có series nào.
      </p>
    );
  }

  return (
    <ScrollableRow gapClassName="gap-3">
      {series.map((s) => (
        <Link
          key={s.id}
          href={`/series/${s.slug}`}
          className="group min-w-[220px] max-w-[220px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-hover)]"
        >
          <SeriesMosaic entries={s.entries} />
          <div className="p-3">
            <p className="line-clamp-1 text-[14px] font-bold text-[var(--foreground)]">
              {s.title}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--primary)]">
              <BookOpen size={11} aria-hidden="true" />
              {s._count.entries} phần
            </p>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-[var(--muted)]">
              {s.description}
            </p>
          </div>
        </Link>
      ))}
    </ScrollableRow>
  );
}

function SeriesMosaic({ entries }: { entries: ContentSeriesListItem["entries"] }) {
  const icons = entries.map((e) => e.icon).filter((i): i is string => Boolean(i)).slice(0, 4);

  if (icons.length === 0) {
    return (
      <div className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
        <BookOpen size={22} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <div className="grid h-24 w-full grid-cols-2 gap-px bg-[var(--border)]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-[20px]"
        >
          {icons[i] ?? ""}
        </div>
      ))}
    </div>
  );
}
