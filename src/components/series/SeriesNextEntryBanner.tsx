import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentSeriesEntrySummary } from "@/lib/api/content-series";

// Bang gioi thieu Entry KE TIEP - thay the han 3-the Prev/You are here/Next
// cu (SeriesEntryPagination.tsx, da xoa) theo dung anh mau nguoi dung gui:
// nen mau nhat + nhan "Next · <category>" + tieu de + mo ta + 1 nut tron
// mui ten ben phai. KHONG con hien Previous/You are here nua.
//
// [2026-09-15] Bleed CA 2 BEN (-mx, khong con chi -ml) - yeu cau nguoi dung
// DAO NGUOC lai quyet dinh 2026-09-14 ben duoi: "Phần Next cuối trang tôi
// muốn cho nó thành full ra". Component nay gio la sibling NGOAI hang flex
// article+aside (xem [entrySlug]/page.tsx) - aside sticky da ket thuc cung
// do cao voi article NGAY PHIA TREN, nen bleed ca 2 ben KHONG con de/tran
// len <aside> nua nhu ban dau. KHONG con mt-10 (margin rieng) - noi NGAY sau
// padding-bottom cua <article> phia tren (xem comment o page.tsx: "Tăng
// padding bottom cho phần thân trên rồi nối sát vào") de khong con khoang
// trong lo lung giua vien border-r cua article va vien border-t cua banner
// nay (yeu cau nguoi dung: "không nhìn thấy đoạn border thẳng bên trên bị
// ngắt đứt đoạn").
//
// [Lich su 2026-09-14, DA DAO NGUOC] Truoc do CHI bleed sang TRAI (khong
// -mr) vi luc do component nay nam TRONG cung 1 cot flex-1 VOI <article>,
// canh PHAI phai dung lai o mep cot do de khong lan qua <aside> ben canh.
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
    <div className="group -mx-6 flex items-center justify-between gap-6 border-t border-b border-border bg-surface-muted px-6 py-8 lg:-mx-10 lg:px-10">
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
