import { FadeIn } from "@/components/series/SeriesSkeleton";
import {
  SidebarSkeleton,
  EntryHeaderSkeleton,
  EntryBodySkeleton,
  EntryTocSkeleton,
} from "@/components/series/series-skeletons";

// Fallback cho CA route segment (layout + page) - chi hien trong khoanh khac
// rat ngan luc React vua bat dau chuan bi RSC payload (Next.js luon hien
// loading.tsx 1 nhip luc dieu huong vao 1 segment moi, du segment do gan nhu
// khong suspend gi o tang ngoai cung - xem layout.tsx/[entrySlug]/page.tsx:
// CA 2 deu day het phan cho du lieu vao cac <Suspense> LONG BEN TRONG voi
// skeleton rieng, xem series-skeletons.tsx). Dong bo GIAO DIEN voi cac
// skeleton do (khung sidebar + header + body + toc) thay vi 1 spinner tron
// chung chung - tranh cam giac "nhay" giua 2 kieu loading khac nhau ngay
// trong CUNG 1 lan tai trang.
export default function SeriesReadLoading() {
  return (
    <div className="-mx-4 -my-6 flex sm:-mx-6 lg:-mx-10">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-[#f5f6f8] p-6 lg:block">
        <FadeIn>
          <SidebarSkeleton />
        </FadeIn>
      </aside>
      <div className="min-w-0 flex-1 bg-[#FAFBFC] p-6 lg:p-10">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <FadeIn>
              <EntryHeaderSkeleton />
            </FadeIn>
            <FadeIn>
              <EntryBodySkeleton />
            </FadeIn>
          </div>
          <div className="hidden h-fit w-56 shrink-0 xl:block">
            <FadeIn>
              <EntryTocSkeleton />
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
