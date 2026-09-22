import { notFound } from "next/navigation";
import Link from "next/link";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { SeriesSidebar } from "@/components/series/SeriesSidebar";

// Layout rieng cho khu vuc sua/tao Entry (manage/entries/[entrySlug],
// manage/entries/new) - yeu cau nguoi dung: "muốn đổi sang bài khác sửa
// phải về trang kia xong chọn bài khác... list ra bên trái các bài theo
// các cấp độ lồng nhau, để chuyển bài chỉnh sửa cho nhanh". Tai su dung
// THANG SeriesSidebar (cay category/entry dung cho ban doc cong khai) qua
// prop `basePath` moi them - CHI khac diem den link (tro ve trang SUA thay
// vi trang DOC), giao dien/active-state/accordion giu nguyen y het.
//
// KHONG dat o "manage/layout.tsx" (cap cha) - trang tong quan
// "manage/page.tsx" co chu dich rieng can TOAN BO be rong (xem comment
// trong chinh no) cho SeriesManageTabs/cay keo-tha, khong phu hop them
// sidebar co dinh o day.
export default async function ManageEntriesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

  return (
    <div className="flex min-w-0 gap-8 pb-20">
      <aside className="hidden w-64 shrink-0 lg:block">
        {/* sticky + max-h + scrollbar-none - dung y het (read)/layout.tsx
            (sidebar cong khai) de cay dai van cuon rieng duoc, khong tran
            qua viewport. */}
        <div className="scrollbar-none sticky top-6 max-h-[calc(100vh-var(--header-height)-24px)] overflow-y-auto rounded-lg border border-border bg-[#f5f6f8] p-[18px]">
          <Link
            href={`/series/${slug}/manage`}
            className="mb-4 block truncate px-2.5 text-[14px] font-semibold text-ink hover:text-primary"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {series.title}
          </Link>
          <SeriesSidebar
            basePath={`/series/${slug}/manage/entries`}
            categories={series.categories}
            entries={series.entries}
          />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
