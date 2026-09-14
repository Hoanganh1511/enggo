import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getContentSeriesEntryAction } from "@/actions/discover/content-series/get-content-series-entry";
import type { ContentSeriesEntryPage } from "@/lib/api/content-series";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { DocsToc } from "@/components/docs/DocsToc";
import { extractDocsToc } from "@/lib/docs/docs-toc";
import {
  EntryDownloadButtons,
  ENTRY_CONTENT_ID,
} from "@/components/series/EntryDownloadButtons";
import { SeriesIconGlyph } from "@/components/series/series-icon-options";
import { SeriesInstallWidget } from "@/components/series/SeriesInstallWidget";
import { SeriesShareButtons } from "@/components/series/SeriesShareButtons";
import { SeriesEntryPagination } from "@/components/series/SeriesEntryPagination";
import { FadeIn } from "@/components/series/SeriesSkeleton";
import {
  EntryHeaderSkeleton,
  EntryBodySkeleton,
  EntryTocSkeleton,
  EntryExtrasSkeleton,
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
      <p className="font-content text-[13px] text-ink-faint">
        <Link
          href={`/series/${slug}`}
          className="hover:text-ink hover:underline"
        >
          {series.title}
        </Link>
        {"  ·  "}
        {String(positionIndex).padStart(2, "0")} /{" "}
        {String(totalCount).padStart(2, "0")}
        {" · "}
        {entry.readTimeMinutes} phút đọc
      </p>

      <div className="font-content mt-2 flex items-start gap-2.5">
        {entry.icon && (
          <SeriesIconGlyph
            name={entry.icon}
            size={26}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-ink-faint"
          />
        )}
        <div>
          <h1 className="text-[30px] sm:text-[2.125rem]  my-6 font-extrabold text-ink">
            {entry.title}
          </h1>
          {entry.subtitle && (
            <p className="mt-1 text-[18.5px] text-ink-faint">
              {entry.subtitle}
            </p>
          )}
        </div>
      </div>

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

// Batch 3 - Cai dat/Chia se/Prev-Next: nhom "phu", it quan trong nhat, dat
// SAU CUNG trong article - dung tinh than Carbon "chi skeleton phan cau truc
// chinh, phan phu tai sau".
async function EntryExtras({
  dataPromise,
  slug,
}: {
  dataPromise: EntryDataPromise;
  slug: string;
}) {
  const data = await dataPromise;
  if (!data) notFound();
  const { series, entry, prev, next, totalCount } = data;
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

      {totalCount > 1 && (
        <SeriesEntryPagination
          seriesSlug={slug}
          prev={prev}
          current={{ title: entry.title }}
          next={next}
        />
      )}
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
      <Suspense
        fallback={
          <FadeIn>
            <EntryHeaderSkeleton />
          </FadeIn>
        }
      >
        <EntryHeader dataPromise={dataPromise} slug={slug} />
      </Suspense>

      {/* Duong ke ngang tach tieu de/mo ta khoi than bai - yeu cau nguoi
          dung, khop mockup tham khao. Nam NGOAI hang flex 2 cot ben duoi (het
          chieu rong ca article LAN aside) - truoc day nam TRONG <article>
          nen TOC/aside ben phai bat dau ngay tu dinh trang (ngang hang
          breadcrumb), khong khop vi tri bat dau THAT cua than bai (nguoi
          dung bao loi). */}
      <hr className="my-6 border-border" />

      {/* gap-6 (khong phai gap-8 nhu truoc) - aside da tu them pl-8 RIENG cho
          khoang trong SAU duong ke doc (border-l), cong don voi gap cua flex
          cha se thanh khoang cach thua qua muc. */}
      <div className="flex gap-6">
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
    </div>
  );
}
