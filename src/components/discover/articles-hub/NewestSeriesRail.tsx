import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { ContentSeriesListItem } from "@/lib/api/content-series";
import { ScrollableRow } from "./ScrollableRow";

// "Series mới nhất" tren /home. Ban dau lam theo mau "注目キーワード" (Yahoo
// Japan trending rail, the co thumbnail anh/mosaic mau sac) nhung XUNG DOT
// voi huong tham my "phang, content-first, khong trang tri anh" cua AI Hero
// token set (xem docs/ai-hero-design-tokens.md - nguoi dung phan hoi the cu
// "không hợp phong cách phẳng AI Hero"). Bo han khoi mosaic/gradient, chi con
// 1 hang icon nho (toi da 4 emoji cua 4 entry dau, cung du lieu cu nhung
// hien THU YEU khong CHIEM DIEN TICH lon) + tieu de + so lieu + mo ta - toan
// bo the la text/border, khong con khoi mau trang tri nao.
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
      {series.map((s) => {
        const icons = s.entries
          .map((e) => e.icon)
          .filter((i): i is string => Boolean(i))
          .slice(0, 4);
        return (
          <Link
            key={s.id}
            href={`/series/${s.slug}`}
            className="min-w-[220px] max-w-[220px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-3.5 transition hover:border-[var(--border-strong)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--muted)]">
                <BookOpen size={12} aria-hidden="true" />
                {s._count.entries} phần
              </span>
              {icons.length > 0 && (
                <span className="flex items-center gap-0.5 text-[13px]" aria-hidden="true">
                  {icons.map((icon, i) => (
                    <span key={i}>{icon}</span>
                  ))}
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-1 text-[14px] font-bold text-[var(--foreground)]">
              {s.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[var(--muted)]">
              {s.description}
            </p>
          </Link>
        );
      })}
    </ScrollableRow>
  );
}
