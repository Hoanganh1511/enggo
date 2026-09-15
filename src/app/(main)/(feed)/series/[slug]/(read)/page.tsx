import { notFound } from "next/navigation";
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
// [2026-09-15] Thu lam lai bang redirect() 1 lan nua, nhung nguoi dung
// chot huong khac: "Không phải là điều hướng sang map, mà ngay từ chỗ link
// để sang seri ấy, bạn thêm /map vào sau luôn" - tuc la KHONG dung
// redirect() server-side o day nua (tranh han rui ro crash da gap phai),
// thay vao do MOI noi TRO toi 1 Series (series list, rail /home, breadcrumb
// Entry...) tu SUA HREF de tro THANG toi "/series/{slug}/map" ngay tu dau -
// xem cac cho da sua: series/page.tsx, NewestSeriesRail.tsx,
// [entrySlug]/page.tsx (breadcrumb). Trang nay (URL goc /series/{slug})
// VAN ton tai binh thuong (khong con bi chan boi redirect) - chi con duoc
// ghe truc tiep qua URL go tay/link cu tu ben ngoai.
export default async function SeriesOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

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
