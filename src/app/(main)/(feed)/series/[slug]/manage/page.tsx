import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { SeriesManageTabs } from "@/components/series/SeriesManageTabs";
import { ManageBreadcrumb } from "@/components/series/ManageBreadcrumb";

// Trang quan ly 1 Series (Cap 1: thong tin chung + Cap 2: cay category/entry) -
// nam NGOAI nhom route (read) (xem [slug]/(read)/layout.tsx) nen KHONG bi
// keo theo sidebar doc cong khai (SeriesSidebar) - trang nay can toan bo be
// rong cho form/tree. Noi dung thuc su (3 khoi Thong tin chung/Cau truc/Vung
// nguy hiem) dua vao SeriesManageTabs (tabs, khong con xep tuan tu tren 1
// trang dai - "Cấu trúc" truoc day o duoi cung, phai cuon rat xa).
export default async function SeriesManagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

  return (
    <div className="w-full pb-20">
      <ManageBreadcrumb items={[{ label: "Series", href: "/series" }, { label: series.title }]} />

      {/* /map (khong phai bare /series/{slug}) - dong bo voi moi noi khac
          da tro toi Series (yeu cau nguoi dung: "về nguyên seri thì phải có
          /map chứ?" - cho nay bi sot lai lan truoc). */}
      <Link
        href={`/series/${slug}/map`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={13} />
        Xem trang công khai
      </Link>

      <h1 className="text-[22px] font-bold text-ink">Quản lý: {series.title}</h1>

      <div className="mt-6">
        <SeriesManageTabs series={series} seriesSlug={slug} />
      </div>
    </div>
  );
}
