import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentSeriesEntrySummary } from "@/lib/api/content-series";

// Bang FULL-WIDTH gioi thieu Entry KE TIEP - thay the han 3-the Prev/You are
// here/Next cu (SeriesEntryPagination.tsx, da xoa) theo dung anh mau nguoi
// dung gui: 1 vung rieng tran het chieu rong khu vuc noi dung (bam qua ca 2
// cot article+aside phia tren, KHONG chi nam trong <article>), nen mau nhat
// + nhan "Next · <category>" + tieu de + mo ta + 1 nut tron mui ten ben
// phai. KHONG con hien Previous/You are here nua - dung y het pham vi anh
// mau ("làm nguyên hẳn 1 vùng để cho next bài tiếp theo").
export function SeriesNextEntryBanner({
  seriesSlug,
  next,
  categoryTitle,
}: {
  seriesSlug: string;
  next: ContentSeriesEntrySummary;
  categoryTitle: string | null;
}) {
  return (
    // -mx-6 lg:-mx-10 - tran sat 2 mep cua vung noi dung, huy dung padding
    // p-6/lg:p-10 cua the div cha (xem layout.tsx: "min-w-0 flex-1 bg-surface
    // p-6 lg:p-10") - CHI dung trong pham vi component nay (khong dung chung
    // o noi khac) nen bake thang vao day cho gon, khong can 1 div boc rieng
    // moi lan goi.
    // div THUONG (khong phai <Link>) - CHI nut tron mui ten ben duoi moi
    // nhan click/dieu huong (yeu cau nguoi dung: "Chỉ nhận event khi click
    // đúng button icon mũi tên thôi nhé") - truoc do CA vung boc ngoai la 1
    // <Link>, click bat ky dau trong bang deu dieu huong.
    <div className="group -mx-6 mt-10 flex items-center justify-between gap-6 border-t border-b border-border bg-surface-muted px-6 py-8 lg:-mx-10 lg:px-10">
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          Next{categoryTitle ? ` · ${categoryTitle}` : ""}
        </p>
        <h3 className="font-content mt-1 truncate text-[20px] font-bold text-ink">
          {next.navTitle || next.title}
        </h3>
        {next.subtitle && (
          <p className="font-content mt-1.5 line-clamp-2 max-w-2xl text-[14px] text-ink-muted">
            {next.subtitle}
          </p>
        )}
      </div>
      <Link
        href={`/series/${seriesSlug}/${next.slug}`}
        aria-label={`Bài tiếp theo: ${next.navTitle || next.title}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-150 ease-out hover:translate-x-0.5"
      >
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}
