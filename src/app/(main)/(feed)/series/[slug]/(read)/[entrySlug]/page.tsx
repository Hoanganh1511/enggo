import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Pencil, Settings } from "lucide-react";
import { getContentSeriesEntryAction } from "@/actions/discover/content-series/get-content-series-entry";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import type { ContentSeriesEntryPage } from "@/lib/api/content-series";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { DocsToc } from "@/components/docs/DocsToc";
import { extractDocsToc } from "@/lib/docs/docs-toc";
import { extractQuestionPickerToc } from "@/lib/docs/question-picker-toc";
import {
  EntryDownloadButtons,
  ENTRY_CONTENT_ID,
} from "@/components/series/EntryDownloadButtons";
import { SeriesInstallWidget } from "@/components/series/SeriesInstallWidget";
import { SeriesShareButtons } from "@/components/series/SeriesShareButtons";
import { SeriesNextEntryBanner } from "@/components/series/SeriesNextEntryBanner";
import { SeriesQuestionPickerToc } from "@/components/series/SeriesQuestionPickerToc";
import { FadeIn } from "@/components/series/SeriesSkeleton";
import {
  EntryHeaderSkeleton,
  EntryBodySkeleton,
  EntryTocSkeleton,
  EntryExtrasSkeleton,
  EntryNextBannerSkeleton,
} from "@/components/series/series-skeletons";

type EntryDataPromise = Promise<ContentSeriesEntryPage | null>;

// Batch 1 (Progressive Loading, xem comment o SeriesEntryPage duoi) -
// breadcrumb + tieu de/subtitle + source badge, phan QUAN TRONG NHAT nen len
// truoc, KHONG cho doi cung luc voi than bai (co the nang hon vi con phai
// render markdown).
async function EntryHeader({
  dataPromise,
  slug,
}: {
  dataPromise: EntryDataPromise;
  slug: string;
}) {
  const data = await dataPromise;
  if (!data) notFound();
  const { series, entry, totalCount } = data;
  const positionIndex = entry.orderIndex + 1;

  return (
    <FadeIn>
      {/* Tach ro 2 nhom: breadcrumb (Series / Tieu de series - dieu huong
          duoc, mau dam hon) VA metadata (vi tri/thoi gian doc - CHI thong
          tin, khong bam duoc, mau nhat hon + 1 vach doc ngan cach ro voi
          breadcrumb) - yeu cau nguoi dung: "Breadcrumb chưa phân cách nhìn
          có sự rõ rệt. lẫn lộn cả thời gian đọc vào đây" (truoc do CA 4 phan
          dung chung 1 mau/1 kieu dau cham "·" nhu nhau, nhin thanh 1 chuoi
          phang khong phan tach). */}
      <div className="font-content flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-ink-muted">
          <Link href="/series" className="hover:text-ink hover:underline">
            Series
          </Link>
          <span className="text-ink-faint" aria-hidden="true">
            /
          </span>
          <Link
            href={`/series/${slug}`}
            className="hover:text-ink hover:underline"
          >
            {series.title}
          </Link>
        </nav>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        <span className="flex items-center gap-1.5 tabular-nums text-ink-faint">
          <span>
            {String(positionIndex).padStart(2, "0")} /{" "}
            {String(totalCount).padStart(2, "0")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} strokeWidth={2} aria-hidden="true" />
            {entry.readTimeMinutes} phút đọc
          </span>
        </span>
      </div>

      {/* entry.icon KHONG hien o day - CHI dung trong SeriesSidebar.tsx (yeu
          cau nguoi dung: "icon chỉ hiện trên sidebar thôi, không liên quan
          gì vào trong title, subtitle của bài viết"). */}
      <div className="font-content mt-2">
        <h1 className="text-[30px] sm:text-[2.125rem]  my-6 font-extrabold text-ink">
          {entry.title}
        </h1>
        {entry.subtitle && (
          <p className="mt-1 text-[18.5px] text-ink-faint">
            {entry.subtitle}
          </p>
        )}
      </div>

      {/* Grid box TOC (H2) - NGAY DUOI subtitle (yeu cau nguoi dung: "cái
          box toc sẽ hiện dạng grid ở dưới subtitle") - chuyen tu EntryBody
          len day, van dung CHUNG 1 ham quet extractQuestionPickerToc tren
          entry.contentMarkdown. */}
      <SeriesQuestionPickerToc items={extractQuestionPickerToc(entry.contentMarkdown)} />

      <EntryDownloadButtons
        title={entry.title}
        contentMarkdown={entry.contentMarkdown}
      />

      {entry.source && (
        <span className="mt-3 inline-block rounded-md bg-surface-muted px-2 py-1 font-mono text-[12px] text-ink-faint">
          {entry.source}
        </span>
      )}
    </FadeIn>
  );
}

// Batch 2 - than bai (DocsMarkdown, kha tinh toan de render voi bai dai) +
// FAQ (di ngay theo, van la NOI DUNG CHINH nen giu cung tang voi than bai).
async function EntryBody({ dataPromise }: { dataPromise: EntryDataPromise }) {
  const data = await dataPromise;
  if (!data) notFound();
  const { entry } = data;

  return (
    <FadeIn>
      <div id={ENTRY_CONTENT_ID} className="mt-6">
        <DocsMarkdown markdown={entry.contentMarkdown} />
      </div>

      {entry.faq && entry.faq.length > 0 && (
        <div className="font-content mt-8 border-t border-border pt-6">
          <h2 className="mb-3 text-[18px] font-semibold text-ink">
            Câu hỏi thường gặp
          </h2>
          <div className="flex flex-col gap-4">
            {entry.faq.map((item) => (
              <div key={item.question}>
                <p className="font-semibold text-ink">{item.question}</p>
                <div className="mt-1 text-[14px] text-ink-muted">
                  <DocsMarkdown markdown={item.answer} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </FadeIn>
  );
}

// Batch 2 - "On This Page" (aside phai) - tinh tu CHINH noi dung than bai
// (extractDocsToc), nen cung tang voi EntryBody la hop ly (khong the co
// truoc noi dung).
async function EntryToc({ dataPromise }: { dataPromise: EntryDataPromise }) {
  const data = await dataPromise;
  if (!data) notFound();
  const toc = extractDocsToc(data.entry.contentMarkdown);

  return (
    <FadeIn>
      <DocsToc toc={toc} />
    </FadeIn>
  );
}

// Batch 3 - Cai dat/Chia se: nhom "phu", it quan trong nhat, dat SAU CUNG
// trong article - dung tinh than Carbon "chi skeleton phan cau truc chinh,
// phan phu tai sau". Prev/Next KHONG con o day nua - xem EntryNextBanner
// (rieng, full-width, nam NGOAI hang flex article+aside - yeu cau nguoi
// dung).
async function EntryExtras({
  dataPromise,
  slug,
}: {
  dataPromise: EntryDataPromise;
  slug: string;
}) {
  const data = await dataPromise;
  if (!data) notFound();
  const { series, entry } = data;
  const installTabs = entry.installTabs ?? series.installTabs;
  const entryUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/series/${slug}/${entry.slug}`;

  return (
    <FadeIn>
      {installTabs.length > 0 && (
        <div className="mt-8">
          <h2 className="font-content mb-3 text-[15px] font-semibold text-ink">
            Cài đặt
          </h2>
          <SeriesInstallWidget tabs={installTabs} />
        </div>
      )}

      <div className="mt-8">
        <SeriesShareButtons
          channels={series.shareChannels}
          url={entryUrl}
          title={entry.title}
        />
      </div>
    </FadeIn>
  );
}

// Batch 3 - Bang FULL-WIDTH gioi thieu Entry ke tiep (SeriesNextEntryBanner.tsx) -
// TACH RIENG khoi EntryExtras (o tren) vi phai nam NGOAI hang flex
// article+aside moi tran het duoc chieu rong (xem SeriesEntryPage duoi) -
// thay the han 3-the Prev/You are here/Next cu, yeu cau nguoi dung: "làm
// nguyên hẳn 1 vùng để cho next bài tiếp theo" (kem anh mau). Entry CUOI
// cung cua Series (next=null) thi khong render gi ca.
async function EntryNextBanner({
  dataPromise,
  slug,
}: {
  dataPromise: EntryDataPromise;
  slug: string;
}) {
  const data = await dataPromise;
  if (!data) notFound();
  const { series, next } = data;
  if (!next) return null;
  const categoryTitle =
    series.categories.find((c) => c.id === next.categoryId)?.title ?? null;

  return (
    <FadeIn>
      <SeriesNextEntryBanner
        seriesSlug={slug}
        next={next}
        categoryTitle={categoryTitle}
      />
    </FadeIn>
  );
}

// Batch 3 - Share icon GON o aside phai (duoi TOC, sau khi bo "Where this
// fits" theo yeu cau nguoi dung) - yeu cau
// nguoi dung "bên dưới toc bên phải bổ sung thêm link socials để share bài
// viết luôn". Tinh entryUrl LAP LAI y het EntryExtras (khong tach chung ham
// vi 2 nhanh Suspense doc lap, moi nhanh chi await 1 lan chinh dataPromise -
// tach ham rieng se phai truyen them tham so khong dang, trong khi phep tinh
// nay cuc re).
async function EntrySidebarShare({
  dataPromise,
  slug,
}: {
  dataPromise: EntryDataPromise;
  slug: string;
}) {
  const data = await dataPromise;
  if (!data) notFound();
  const { series, entry } = data;
  const entryUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/series/${slug}/${entry.slug}`;
  if (series.shareChannels.length === 0) return null;

  return (
    <FadeIn>
      <div className="border-t border-border pt-4">
        <p className="font-content mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          Share
        </p>
        <SeriesShareButtons
          channels={series.shareChannels}
          url={entryUrl}
          title={entry.title}
          compact
        />
      </div>
    </FadeIn>
  );
}

// Batch 3 - Cum nut doc "Sua Entry"/"Quan ly Series" bam sat MEP PHAI man
// hinh, CHI hien voi admin (yeu cau nguoi dung: "nếu là tác giả của series
// thì thêm cụm button layout dọc bám sát màn hình bên phải") - Series
// KHONG co field lien ket toi 1 User cu the (chi `authorName` la CHUOI TEXT
// tu do, khong phai FK) nen "tác giả" o day anh xa dung theo QUYEN admin da
// dung xuyen suot module nay (AdminGuard ben backend, giong het cach nut
// gear "Quản lý series" TRUOC DAY tung gate - da bo khoi sidebar/mobile nav
// theo yeu cau rieng khac, gio quay lai duoi dang cum nut noi nay). Fixed
// (khong sticky) - bam theo VIEWPORT chu khong theo vi tri cuon trong trang.
async function EntryAuthorRail({
  dataPromise,
  slug,
}: {
  dataPromise: EntryDataPromise;
  slug: string;
}) {
  const [data, status] = await Promise.all([dataPromise, getSelfStatusAction()]);
  if (!data || !status.isAdmin) return null;
  const { entry } = data;

  return (
    // Nut co CHU (khong chi icon) - de/de nhan ra hon (yeu cau nguoi dung
    // sau khi khong ro nut nao la "edit series": "cho button edit series
    // vào đấy, dẫn thẳng tới bài hiện tại luôn để edit cũng dc"). "Sửa bài
    // này" dan THANG toi trang sua CHINH Entry dang xem (dung y het "edit
    // series" nguoi dung mo ta - danh cho sua NHANH bai hien tai); "Quản lý
    // series" moi la trang day du (tab Thong tin chung/Cau truc/Vung nguy
    // hiem, xem SeriesManagePage).
    <div className="fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 flex-col gap-1.5 rounded-2xl border border-border bg-surface p-1.5 shadow-md lg:flex">
      <Link
        href={`/series/${slug}/manage/entries/${entry.slug}`}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium whitespace-nowrap text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
      >
        <Pencil size={14} strokeWidth={2} aria-hidden="true" />
        Sửa bài này
      </Link>
      <Link
        href={`/series/${slug}/manage`}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium whitespace-nowrap text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
      >
        <Settings size={14} strokeWidth={2} aria-hidden="true" />
        Quản lý series
      </Link>
    </div>
  );
}

// Trang 1 Entry (dac ta muc 2.2) - Progressive Loading + Skeleton States
// (yeu cau nguoi dung 2026-09-14, xem docs/engineering-log.md): 1 Promise
// DUY NHAT (KHONG await o day) truyen xuong 5 nhanh Suspense doc lap
// (Header/Body/Toc/Extras/WhereFits) - ca 5 await CHUNG 1 instance (chi 1
// request that toi backend, KHONG goi lai action nhieu lan) nhung moi nhanh
// co Suspense + skeleton fallback RIENG (xem series-skeletons.tsx), cho phep
// React stream tung chunk doc lap thay vi doi TOAN BO trang render xong roi
// moi tra ve. Thu tu Suspense trong JSX = thu tu uu tien hien thi: Batch 1
// (Header, quan trong nhat) -> Batch 2 (Body+Toc, noi dung chinh) -> Batch 3
// (Extras+WhereFits, phu). notFound() goi rieng trong TUNG nhanh (thay vi 1
// lan o dau ham) - Next.js cho phep goi tu Server Component nam sau Suspense.
export default async function SeriesEntryPage({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}) {
  const { slug, entrySlug } = await params;
  const dataPromise = getContentSeriesEntryAction(slug, entrySlug).catch(
    () => null,
  );

  return (
    <div className="pb-20">
      {/* pb-6 o day (thay vi my-6 tren chinh <hr> ben duoi) - yeu cau nguoi
          dung: "không muốn nó margin y 6... điều chỉnh padding của các phần
          tiếp giáp với nó để bù không gian" - khoang cach TRUOC hr gio la
          padding-bottom cua khoi header nay, khong con la margin cua <hr>. */}
      <div className="pb-6">
        <Suspense
          fallback={
            <FadeIn>
              <EntryHeaderSkeleton />
            </FadeIn>
          }
        >
          <EntryHeader dataPromise={dataPromise} slug={slug} />
        </Suspense>
      </div>

      {/* Duong ke ngang tach tieu de/mo ta khoi than bai - yeu cau nguoi
          dung, khop mockup tham khao. Nam NGOAI hang flex 2 cot ben duoi (het
          chieu rong ca article LAN aside) - truoc day nam TRONG <article>
          nen TOC/aside ben phai bat dau ngay tu dinh trang (ngang hang
          breadcrumb), khong khop vi tri bat dau THAT cua than bai (nguoi
          dung bao loi). KHONG con my-6 (xem pb-6/pt-6 o 2 khoi tiep giap). */}
      <hr className="border-border" />

      {/* gap-6 (khong phai gap-8 nhu truoc) - aside da tu them pl-8 RIENG cho
          khoang trong SAU duong ke doc (border-l), cong don voi gap cua flex
          cha se thanh khoang cach thua qua muc. pt-6 - khoang cach SAU hr
          (xem comment pb-6 o tren). */}
      <div className="flex gap-6 pt-6">
        <article className="min-w-0 flex-1">
          <Suspense
            fallback={
              <FadeIn>
                <EntryBodySkeleton />
              </FadeIn>
            }
          >
            <EntryBody dataPromise={dataPromise} />
          </Suspense>

          <Suspense
            fallback={
              <FadeIn>
                <EntryExtrasSkeleton />
              </FadeIn>
            }
          >
            <EntryExtras dataPromise={dataPromise} slug={slug} />
          </Suspense>
        </article>

        {/* Duong ke doc tach cot TOC ben phai - yeu cau nguoi dung. pl-8
            (thay vi dua vao gap-8 cua flex cha) de co khoang trong GIUA
            duong ke va chu, khong bam sat vien. sticky top-6: bat dau CUNG
            vi tri voi than bai (ngay sau hr o tren, khong con o tren cung
            trang nua) roi dinh lai o do khi cuon xuong. */}
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 flex-col gap-6 border-l border-border pl-8 xl:flex">
          <Suspense
            fallback={
              <FadeIn>
                <EntryTocSkeleton />
              </FadeIn>
            }
          >
            <EntryToc dataPromise={dataPromise} />
          </Suspense>

          <Suspense fallback={null}>
            <EntrySidebarShare dataPromise={dataPromise} slug={slug} />
          </Suspense>
        </aside>
      </div>

      {/* Full-width, NGOAI hang flex article+aside o tren (yeu cau nguoi
          dung: 1 vung RIENG tran het chieu rong cho Entry ke tiep, xem
          EntryNextBanner/SeriesNextEntryBanner.tsx). */}
      <Suspense fallback={<EntryNextBannerSkeleton />}>
        <EntryNextBanner dataPromise={dataPromise} slug={slug} />
      </Suspense>

      {/* Fixed, khong phu thuoc vi tri trong luong trang - Suspense fallback
          null (khong quan trong, khong can skeleton rieng). */}
      <Suspense fallback={null}>
        <EntryAuthorRail dataPromise={dataPromise} slug={slug} />
      </Suspense>
    </div>
  );
}
