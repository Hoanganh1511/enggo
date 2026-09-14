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
// [2026-09-14] DA THU auto-redirect sang Entry dau tien (yeu cau nguoi dung
// "dẫn vào trang map, không phải trang theo tiêu đề") nhung gay crash that
// tren production (Vercel bao "This page couldn't load" - loi ket noi/mang,
// KHONG phai 404/loi Next.js binh thuong => nghi ngo function bi crash/treo
// o tang server, chua ro nguyen nhan chinh xac vi khong xem duoc log server
// that). DA REVERT ve render tong quan nhu cu de KHONG con chan nguoi dung
// truy cap Series - se lam lai auto-redirect sau khi xac dinh duoc nguyen
// nhan that qua Vercel function logs.
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
