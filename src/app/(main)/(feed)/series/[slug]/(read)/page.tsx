import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { SeriesStatsBar } from "@/components/series/SeriesStatsBar";
import { SeriesInstallWidget } from "@/components/series/SeriesInstallWidget";
import { SeriesEmailSignup } from "@/components/series/SeriesEmailSignup";

// Trang tong quan Series (dac ta muc 2.1) - tai su dung DocsMarkdown cho phan
// mo ta (rich text: **bold**/link/inline code) thay vi viet lai 1 renderer
// markdown khac, component do da doc lap voi "docs" (chi nhan 1 chuoi
// markdown) nen dung duoc cho ca Series.
//
// [2026-09-14] DA THU auto-redirect sang Entry dau tien nhung gay crash
// that tren production 1 lan (Vercel bao "This page couldn't load"), da
// REVERT vi khong xac dinh duoc nguyen nhan qua log.
// [2026-09-15] Thu SUA HREF o moi noi TRO toi 1 Series (series list, rail
// /home, breadcrumb Entry) de tro THANG toi "/series/{slug}/map" thay vi
// redirect() server-side - nhung nguoi dung van tiep tuc ghe duoc URL goc
// nay qua cac duong KHONG kiem soat duoc bang cach sua href (bookmark cu,
// go tay URL, link ngoai...): "Sao cứ vào route của seri luôn vậy? Nó không
// có cái đó. Mặc định của seri là /map". LAM LAI redirect() - lan nay van
// GIU NGUYEN toan bo href da sua sang "/map" truc tiep (khong revert, van
// co ich vi tranh redirect vong lai khi dieu huong tu trong app), CHI thom
// redirect() o day nhu 1 lop BAO DAM CUOI CUNG cho MOI duong con lai dan
// toi URL goc nay.
export default async function SeriesOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

  const landingEntry =
    series.entries.find((e) => e.slug === "map") ?? series.entries[0];
  if (landingEntry?.slug) {
    redirect(`/series/${slug}/${landingEntry.slug}`);
  }

  return (
    <div className="w-full pb-20">
      {/* Anh bia hero - optional, CHI o trang tong quan nay (khac rail "Series
          mới nhất"/danh sach /series, 2 noi do co chu dich giu phang khong
          anh, xem NewestSeriesRail.tsx). */}
      {series.coverImageUrl && (
        <div className="relative mb-5 aspect-3/1 w-full overflow-hidden rounded-xl bg-surface-muted">
          <Image src={series.coverImageUrl} alt="" fill priority className="object-cover" />
        </div>
      )}

      {/* font-content: tieu de Series la NOI DUNG (DocsMarkdown/SeriesStatsBar
          da tu boc font-content rieng ben trong). */}
      <h1 className="font-content text-[30px] font-extrabold tracking-tight text-ink">
        {series.title}
      </h1>
      <div className="mt-3">
        <DocsMarkdown markdown={series.description} />
      </div>

      <SeriesStatsBar stats={series.stats} externalLinks={series.externalLinks} />

      {series.installTabs.length > 0 && (
        <div className="mt-8">
          <h2 className="font-content mb-3 text-[15px] font-semibold text-ink">Cài đặt</h2>
          <SeriesInstallWidget tabs={series.installTabs} />
        </div>
      )}

      {series.emailCourseEnabled && (
        <div className="mt-8">
          <SeriesEmailSignup
            title={series.emailCourseTitle ?? "Nhận bài mới qua email"}
            description={series.emailCourseDescription ?? ""}
          />
        </div>
      )}
    </div>
  );
}
