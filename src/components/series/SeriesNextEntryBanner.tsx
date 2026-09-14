import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentSeriesEntrySummary } from "@/lib/api/content-series";

// Bang gioi thieu Entry KE TIEP - thay the han 3-the Prev/You are here/Next
// cu (SeriesEntryPagination.tsx, da xoa) theo dung anh mau nguoi dung gui:
// nen mau nhat + nhan "Next · <category>" + tieu de + mo ta + 1 nut tron
// mui ten ben phai. KHONG con hien Previous/You are here nua.
//
// [2026-09-14] CHI bleed sang TRAI (khong con -mr, khong con full-width qua
// CA 2 cot) - yeu cau nguoi dung: "cho nó vào đến hết phần thân thôi được
// không... không gian riêng cho cột toc bên phải" - truoc do component nay
// la sibling NGOAI ca hang flex article+aside nen tran qua LUON cot TOC ben
// phai. Gio nam TRONG cung 1 cot flex-1 VOI <article> (xem [entrySlug]/
// page.tsx) nen chi can bleed TRAI (qua padding p-6/lg:p-10 cua the cha,
// xem layout.tsx) - canh PHAI tu dung lai o mep cua chinh cot do, KHONG lan
// qua gap-6 + <aside> nua.
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
    // div THUONG (khong phai <Link>) - CHI nut tron mui ten ben duoi moi
    // nhan click/dieu huong (yeu cau nguoi dung: "Chỉ nhận event khi click
    // đúng button icon mũi tên thôi nhé") - truoc do CA vung boc ngoai la 1
    // <Link>, click bat ky dau trong bang deu dieu huong.
    <div className="group -ml-6 mt-10 flex items-center justify-between gap-6 border-t border-b border-border bg-surface-muted py-8 pr-6 pl-6 lg:-ml-10 lg:pl-10">
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
