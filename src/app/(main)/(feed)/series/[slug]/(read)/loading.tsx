import { FadeIn } from "@/components/series/SeriesSkeleton";
import {
  EntryHeaderSkeleton,
  EntryBodySkeleton,
  EntryTocSkeleton,
  EntryExtrasSkeleton,
  EntryNextBannerSkeleton,
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
//
// [2026-09-15 fix] Cau truc DOM/class o day gio COPY Y HET khung ben ngoai
// cua [entrySlug]/page.tsx (pb-20/pb-6/hr/flex gap-6 pt-6/article+aside) -
// TRUOC DAY chi dung "flex gap-8" don gian, KHAC HAN cau truc that (thieu hr,
// thieu pb-6/pt-6, aside khong sticky/border-l/pl-8, khong co cho cho Extras/
// NextBanner skeleton) - khi Next.js chuyen tu loading.tsx nay SANG cac
// Suspense fallback THAT trong page.tsx, toan bo khung bi RE-LAYOUT dot ngot
// (gap doi tu 8 xuong 6, hr xuat hien, aside dich chuyen...) - nguoi dung bao
// "nó ở 3 kiểu khác nhau... nó bị thay đổi liên tục, chứ không phải xuất hiện
// từng phần dần dần". Dung CHUNG khung + CUNG delay stagger (0/0.12/0.24, xem
// SeriesSkeleton.tsx) voi page.tsx thi luc swap giua 2 file la VO HINH (DOM
// giong het nhau) - nguoi dung chi con thay 1 chuoi Progressive Loading DUY
// NHAT, lien tuc, khong con "nhay khung" giua 2 phien ban skeleton khac nhau.
export default function SeriesReadLoading() {
  return (
    <div className="pb-20">
      <div className="pb-6">
        <FadeIn>
          <EntryHeaderSkeleton />
        </FadeIn>
      </div>

      <hr className="-mx-6 border-border lg:-mx-10" />

      <div className="flex gap-6 pt-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <article className="min-w-0">
            <FadeIn delay={0.12}>
              <EntryBodySkeleton />
            </FadeIn>
            <FadeIn delay={0.24}>
              <EntryExtrasSkeleton />
            </FadeIn>
          </article>

          <FadeIn delay={0.24}>
            <EntryNextBannerSkeleton />
          </FadeIn>
        </div>

        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 flex-col gap-6 border-l border-border pl-8 xl:flex">
          <FadeIn delay={0.12}>
            <EntryTocSkeleton />
          </FadeIn>
        </aside>
      </div>
    </div>
  );
}
