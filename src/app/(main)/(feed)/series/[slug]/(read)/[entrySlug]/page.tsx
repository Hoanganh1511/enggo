import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getContentSeriesEntryAction } from "@/actions/discover/content-series/get-content-series-entry";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import type { ContentSeriesEntryPage } from "@/lib/api/content-series";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { DocsToc } from "@/components/docs/DocsToc";
import { extractDocsToc } from "@/lib/docs/docs-toc";
import {
  EntryDownloadButtons,
  ENTRY_CONTENT_ID,
} from "@/components/series/EntryDownloadButtons";
import { SeriesInstallWidget } from "@/components/series/SeriesInstallWidget";
import { SeriesShareButtons } from "@/components/series/SeriesShareButtons";
import { SeriesNextEntryBanner } from "@/components/series/SeriesNextEntryBanner";
import { SeriesEntryContentBlocks } from "@/components/series/SeriesEntryContentBlocks";
import { EntryPageActionsRow } from "@/components/series/EntryPageActionsRow";
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
  const [data, status] = await Promise.all([
    dataPromise,
    getSelfStatusAction(),
  ]);
  if (!data) notFound();
  const { series, entry, totalCount, next } = data;
  const positionIndex = entry.orderIndex + 1;
  const entryUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/series/${slug}/${entry.slug}`;

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
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-ink-muted"
        >
          <Link href="/series" className="hover:text-ink hover:underline">
            Series
          </Link>
          <span className="text-ink-faint" aria-hidden="true">
            /
          </span>
          <Link
            href={`/series/${slug}/map`}
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
        <h1 className="text-[30px] sm:text-[2.3rem]  my-6 font-extrabold text-ink">
          {entry.title}
        </h1>
        {entry.subtitle && (
          <p className="mt-1 text-[18.5px] text-ink-faint">{entry.subtitle}</p>
        )}
      </div>

      {/* Danh sach khoi noi dung tuy chinh (TOC box/install/buttonGroup/
          callout) - NGAY DUOI subtitle (yeu cau nguoi dung: "cái box toc sẽ
          hiện dạng grid ở dưới subtitle", sau do mo rong thanh nhieu loai
          khoi sap xep duoc: "custom thêm đa dạng các element... sắp xếp thứ
          tự hiển thị"). entry.contentBlocks rong/null -> tu fallback ve 1
          khoi TOC duy nhat, CHI tren entry "map" (xem
          SeriesEntryContentBlocks.tsx - yeu cau nguoi dung: "Chỉ trang Map
          mới cho phép... box TOC dạng khung... Còn đâu không cho"). */}
      <SeriesEntryContentBlocks
        blocks={entry.contentBlocks}
        contentMarkdown={entry.contentMarkdown}
        entrySlug={entry.slug}
      />

      <EntryDownloadButtons
        title={entry.title}
        contentMarkdown={entry.contentMarkdown}
      />

      {entry.source && (
        <span className="mt-3 inline-block rounded-md bg-surface-muted px-2 py-1 font-mono text-[12px] text-ink-faint">
          {entry.source}
        </span>
      )}

      {/* Hang cuoi cung cua cum dau bai, NGAY TRUOC khi xuong than bai - yeu
          cau nguoi dung (khop anh mau tham khao): tac gia + Follow (trai),
          Copy page/Share/Next page (phai). isAdmin/entrySlug - popover
          "Profile/Cập nhật bài viết/Cập nhật Series" khi bam vao avatar+ten
          tac gia (thay the cum nut doc EntryAuthorRail cu, da bo - yeu cau
          nguoi dung: "Bỏ cái cục này đi"). */}
      <EntryPageActionsRow
        authorName={series.authorName}
        authorAvatarUrl={series.authorAvatarUrl}
        contentMarkdown={entry.contentMarkdown}
        shareChannels={series.shareChannels}
        shareUrl={entryUrl}
        shareTitle={entry.title}
        next={next}
        seriesSlug={slug}
        entrySlug={entry.slug}
        isAdmin={status.isAdmin}
      />

      {/* Zone "middle" - giua cum Top va than bai, NGAY TREN <hr> ben duoi -
          yeu cau nguoi dung (them sau cung, mo rong tu he thong block dau
          bai): "thêm 1 button + vào để cho phép người dùng thêm section
          vào giữa" 2 vung Top/Than. */}
      <SeriesEntryContentBlocks
        blocks={entry.contentBlocks}
        contentMarkdown={entry.contentMarkdown}
        entrySlug={entry.slug}
        zone="middle"
        emailCourseEnabled={series.emailCourseEnabled}
        emailCourseTitle={series.emailCourseTitle ?? undefined}
        emailCourseDescription={series.emailCourseDescription ?? undefined}
      />
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
    <FadeIn delay={0.12}>
      {/* [&_hr]:-ml-6 lg:[&_hr]:-ml-10 - CHI BEN TRAI (KHONG con -mr, xem
          sua loi ben duoi). <hr> nay nam TRONG <article> (flex-1, khong co
          padding rieng) - o day CHI can huy padding-left cua panel to (layout.tsx
          "p-6 lg:p-10") vi KHONG co gi chen VAO GIUA hr va mep TRAI panel
          do (article/flex-col wrapper/flex row/pb-20 deu 0 padding trai).
          Nhung BEN PHAI thi KHAC: giua hr va mep phai panel co CA <aside>
          (w-64) + gap-6 chen vao - dung LAI -mr-10 se keo hr LEN QUA khoang
          gap+aside do, tran ra ngoai/de len duong ke doc phan cach TOC (bug
          nguoi dung bao: "line ngang trong bài còn chờm ra ngoài", "Line
          thẳng bên phải không kéo hết"). Ben phai KHONG can bleed gi ca -
          <article> (flex-1, khong padding) da tu nhien cho hr rong DUNG BANG
          chinh no, dung la "full" trong pham vi cot bai viet roi. */}
      <div id={ENTRY_CONTENT_ID} className="mt-6 [&_hr]:-ml-6 lg:[&_hr]:-ml-10">
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
    <FadeIn delay={0.12}>
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
    <FadeIn delay={0.24}>
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

      {/* Zone "bottom" - sau than bai, TRUOC pagination Next (yeu cau nguoi
          dung: "có cả dấu + ở cuối - sau phần thân để thêm section block
          cho phần dưới"). */}
      <SeriesEntryContentBlocks
        blocks={entry.contentBlocks}
        contentMarkdown={entry.contentMarkdown}
        entrySlug={entry.slug}
        zone="bottom"
        emailCourseEnabled={series.emailCourseEnabled}
        emailCourseTitle={series.emailCourseTitle ?? undefined}
        emailCourseDescription={series.emailCourseDescription ?? undefined}
      />
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
    <FadeIn delay={0.24}>
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
    <FadeIn delay={0.24}>
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
          dung bao loi). KHONG con my-6 (xem pb-6/pt-6 o 2 khoi tiep giap).
          -mx-6 lg:-mx-10 them vao - khop DUNG bleed cua cac <hr> trong than
          bai (xem EntryBody, "[&_hr]:-mx-6 lg:[&_hr]:-mx-10") - truoc do
          hr nay CHUA bleed nen ngan hon han cac hr phia duoi, nhin "khác
          riêng" (yeu cau nguoi dung). */}
      <hr className="-mx-6 border-border lg:-mx-10" />

      {/* gap-6 (khong phai gap-8 nhu truoc) - aside da tu them pl-8 RIENG cho
          khoang trong SAU duong ke doc (border-l), cong don voi gap cua flex
          cha se thanh khoang cach thua qua muc.
          [2026-09-15 fix] pt-6 CHUYEN vao BEN TRONG <article>/<aside> (thay
          vi dat o div flex cha nhu truoc) - luc pt-6 nam o div cha, border-r
          cua <article> CHI bat dau SAU khoang pt-6 do (border thuoc ve
          <article>, o DUOI padding-top cua the cha) => ho ra 1 dai TRANG
          NGANG giua <hr> phia tren va diem bat dau THAT cua duong vien doc,
          nhin "2 đường line border không liền mạch" (yeu cau nguoi dung).
          Dua pt-6 vao TRONG <article> (border-r bao QUANH CA phan padding
          do) thi duong vien doc bat dau NGAY tu sat duoi <hr>, khoang cach
          6 gio nam o BEN TRONG khung vien thay vi truoc no. */}
      <div className="flex gap-6">
        {/* pb-10 (khong phai pb-0 mac dinh) - NOI vien border-r cua article
            keo dai xuong THEM 1 khoang truoc khi ket thuc, thay vi dut ngay
            sau EntryExtras roi de lo 1 khoang trang giua duong vien va
            EntryNextBanner ben duoi (yeu cau nguoi dung: "bỏ cái khoảng
            trống so với phần bên trên để không nhìn thấy đoạn border thẳng
            bên trên bị ngắt đứt đoạn... Tăng padding bottom cho phần thân
            trên rồi nối sát vào"). Banner gio nam NGOAI hang flex nay (xem
            duoi) nen se noi SAT ngay sau padding nay, khong con margin-top
            rieng nua. */}
        <article className="min-w-0 flex-1 border-r border-border pb-10">
          <Suspense
            fallback={
              <FadeIn delay={0.12}>
                <EntryBodySkeleton />
              </FadeIn>
            }
          >
            <EntryBody dataPromise={dataPromise} />
          </Suspense>

          <Suspense
            fallback={
              <FadeIn delay={0.24}>
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
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 flex-col gap-6 pt-6 pl-8 xl:flex">
          <Suspense
            fallback={
              <FadeIn delay={0.12}>
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

      {/* [2026-09-15] Chuyen ra NGOAI hang flex article+aside (KHAC ban truoc
          day, xem lich su comment cu trong SeriesNextEntryBanner.tsx) - yeu
          cau nguoi dung dao nguoc lai quyet dinh truoc: "Phần Next cuối
          trang tôi muốn cho nó thành full ra" (tran FULL 2 ben, ke ca qua
          khoang cot TOC, khong con gioi han trong 1 cot nua). Nam SAU hang
          flex (aside sticky da ket thuc cung do cao voi article o tren) nen
          KHONG con overlap gi voi <aside> nua du bleed CA 2 ben. */}
      <Suspense
        fallback={
          <FadeIn delay={0.24}>
            <EntryNextBannerSkeleton />
          </FadeIn>
        }
      >
        <EntryNextBanner dataPromise={dataPromise} slug={slug} />
      </Suspense>
    </div>
  );
}
