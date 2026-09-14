import { FadeIn } from "@/components/series/SeriesSkeleton";
import {
  EntryHeaderSkeleton,
  EntryBodySkeleton,
  EntryTocSkeleton,
} from "@/components/series/series-skeletons";

// Fallback cho CA route segment (layout + page) - chi hien trong khoanh khac
// rat ngan luc React vua bat dau chuan bi RSC payload (Next.js luon hien
// loading.tsx 1 nhip luc dieu huong vao 1 segment moi, du segment do gan nhu
// khong suspend gi o tang ngoai cung - xem layout.tsx/[entrySlug]/page.tsx).
//
// KHONG con ve rieng 1 khung <aside>+SidebarSkeleton o day nua (yeu cau nguoi
// dung: sidebar THAT (trong layout.tsx) van dang hien san khi chuyen Entry
// trong CUNG series - ve THEM 1 ban skeleton "de chong len" canh no la thua,
// gay cam giac nhay/loi). Sidebar that tu layout.tsx se tu hien (hoac trong
// (main)/layout.tsx da co san khung, khong can fallback rieng) - o day CHI
// con skeleton cho phan noi dung/TOC (thu that su thay doi theo tung Entry).
// KHONG boc them "-mx-4 -my-6" o day (khac ban truoc) - do la thu thuat
// RIENG cua layout.tsx (huy padding CUA FeedMainArea, xem comment o do), con
// loading.tsx nay chi lap vao {children} nam BEN TRONG the div noi dung DA
// CO padding rieng cua layout.tsx (p-6 lg:p-10) - lap lai -my-6 o day khien
// no bi "hut" LEN, LECH khoi vi tri that cua noi dung that (page.tsx/
// [entrySlug]/page.tsx khong boc gi them ca, chi render truc tiep) => ho ra 1
// khe giua header va noi dung ma nguoi dung bao. Sua bang cach bo het lop boc
// thua, chi con dung cau truc "flex gap-8" khop y het noi dung that.
export default function SeriesReadLoading() {
  return (
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
  );
}
