import type { ContentSeriesListItem } from "@/lib/api/content-series";
import { SeriesCampaignCard } from "@/components/series/SeriesCampaignCard";
import { ScrollableRow } from "./ScrollableRow";

// "Series mới nhất" tren /home. [2026-09-15] Redesign THANH campaign card
// (SeriesCampaignCard.tsx, variant="compact") - yeu cau nguoi dung, DAO
// NGUOC quyet dinh truoc do (tung bo han anh/mau vi "không hợp phong cách
// phẳng AI Hero") sang huong co anh/badge/CTA/nen mau tuy chinh, cau hinh tu
// tab "Thẻ hiển thị" trong SeriesManageTabs.tsx. isVisible=false thi AN
// khoi rail nay (khong xoa Series).
export function NewestSeriesRail({ series }: { series: ContentSeriesListItem[] }) {
  const visible = series.filter((s) => s.isVisible);
  if (visible.length === 0) {
    return (
      <p className="py-4 text-[13px] text-[var(--muted)]">
        Chưa có series nào.
      </p>
    );
  }

  return (
    <ScrollableRow gapClassName="gap-3">
      {visible.map((s) => (
        <SeriesCampaignCard key={s.id} series={s} variant="compact" />
      ))}
    </ScrollableRow>
  );
}
