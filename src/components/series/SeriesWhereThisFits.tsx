import { cn } from "@/lib/utils";
import type { ContentSeriesCategory } from "@/lib/api/content-series";

// "Where this fits" (dac ta muc 2.2.7) - liet ke TOAN BO category cua Series,
// category chua Entry dang xem in dam + dot mau ro, cac category khac mo hon.
export function SeriesWhereThisFits({
  categories,
  activeCategoryId,
}: {
  categories: ContentSeriesCategory[];
  activeCategoryId: string;
}) {
  const sorted = [...categories].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        Where this fits
      </p>
      <div className="flex flex-col gap-1.5">
        {sorted.map((cat) => {
          const active = cat.id === activeCategoryId;
          return (
            <div
              key={cat.id}
              className={cn(
                "flex items-center gap-2 text-[13px]",
                active ? "font-semibold text-ink" : "text-ink-faint",
              )}
            >
              <span
                className="inline-block size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.colorHex ?? "var(--color-border-strong)" }}
                aria-hidden="true"
              />
              {cat.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
