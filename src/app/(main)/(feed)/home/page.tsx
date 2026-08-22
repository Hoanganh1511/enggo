import { EditorialFeed } from "@/components/discover/home-feed/EditorialFeed";
import { SingleTypeFeedList } from "@/components/discover/home-feed/SingleTypeFeedList";
import { JourneyHero } from "@/components/discover/home-journey/JourneyHero";
import { ChapterShelf } from "@/components/discover/home-journey/ChapterShelf";
import { JourneyAchievements } from "@/components/discover/home-journey/JourneyAchievements";
import { WelcomeOnboardingModal } from "@/components/discover/onboarding/WelcomeOnboardingModal";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getMyJourneyAction } from "@/actions/knowledge-groups/get-my-journey";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { auth } from "@/auth";
import {
  getKindsByContentType,
  CONTENT_TYPES,
  type ContentType,
} from "@/lib/discover/post-kind-meta";
import {
  KNOWLEDGE_WORLDS,
  getTopicBySlug,
  slugToCategoryEnum,
} from "@/lib/discover/knowledge-worlds";
import {
  LATEST_POST_KINDS,
  RESOURCE_KINDS,
  PROJECT_KINDS,
  ACHIEVEMENT_KINDS,
} from "@/lib/discover/home-feed-sections";

// Moi hang carousel cua EditorialFeed chi hien dung 10 bai + nut "Xem tat
// ca" (SectionHeader.viewAllHref) dan sang SingleTypeFeedList - thay cho
// infinite scroll (qua nhieu cho 1 trang chu nhieu hang ngang doc lap, UX
// "cuon vo tan" hop voi 1 danh sach doc DUY NHAT nhu SingleTypeFeedList hon
// la carousel ngang). Xem quyet dinh 2026-08-03 trong docs/engineering-log.md.
const SECTION_LIMIT = 10;
// Rieng "Noi bat hom nay" (sap theo luot thich) va "Trending Topics" (dem
// theo category) can 1 tap mau du RONG de sap/dem cho dung nghia, khong the
// gioi han 10 nhu cac hang loc theo kind - GENERAL_SAMPLE_LIMIT la kich
// thuoc tap mau do, KHONG phai so luong hien thi cuoi cung (featured van chi
// lay 8, trending topics van chi lay 8 the).
const GENERAL_SAMPLE_LIMIT = 30;
// Khi da chon 1 Content Type cu the (SingleTypeFeedList, luoi tu gian) - day
// da la "trang xem tat ca" cua chinh no roi nen can nhieu bai hon 1 hang
// carousel, nhung khong can toi han vi chua co phan trang o view nay.
const SINGLE_TYPE_LIMIT = 40;

// Trang Home DUY NHAT - thay 6 route con cu (/achievements /progress
// /for-it /vote /events, xem lich su git) bang 1 route dieu khien qua query
// param. Topic (?topic=) va Content Type (?type=, chon o HomeSidebar.tsx) la
// 2 truc loc DOC LAP, ket hop dong thoi qua 1 lan fetch server that (KHONG
// con doc/loc client tren feed-store co dinh 50 bai nhu truoc - bat buoc de
// ket hop dung ca 2 truc cung luc).
//
// "world" (?world=): khi CHUA chon Topic con cu the nao trong World dang mo,
// van phai loc duoc theo CA World do - gop category cua TAT CA topic con
// trong world lam 1 mang truyen cho backend (category=FRONTEND,BACKEND,...).
// Thieu buoc nay la ly do bam 1 World (vd "Build") truoc day khong thay gi
// doi tren feed - sidebar chi mo rong danh sach topic, khong he anh huong
// fetch.
//
// Server Component - fetch that CHAY TREN SERVER, HTML tra ve da co san du
// lieu (khong con "use client" + useEffect nhu ban cu). loading.tsx cua route
// nay dam nhiem Suspense fallback tu dong khi doi fetch, khong can tu quan
// state loading/cancelled o day nua.
export default async function HomeFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const username = session?.username;
  const worldSlug = typeof sp.world === "string" ? sp.world : undefined;
  const topicSlug = typeof sp.topic === "string" ? sp.topic : undefined;
  const typeParam = typeof sp.type === "string" ? sp.type : undefined;
  // Truc loc NGHE NGHIEP (sidebar) - doc lap voi world/topic o tren. Khong
  // can validate o day nhu topic/type: slug sai chi lam backend tra ve rong
  // chu khong vo Prisma (day la quan he bang, khong phai enum).
  const groupSlug = typeof sp.group === "string" ? sp.group : undefined;
  const fieldSlug = typeof sp.field === "string" ? sp.field : undefined;

  // Bo qua gia tri topic/type khong hop le (vd go tay URL sai) thay vi gui
  // thang xuong backend - category sai enum se lam Prisma throw loi 500.
  const topic = topicSlug ? getTopicBySlug(topicSlug) : undefined;
  const world =
    !topic && worldSlug
      ? KNOWLEDGE_WORLDS.find((w) => w.slug === worldSlug)
      : undefined;
  const contentType = CONTENT_TYPES.some((t) => t.key === typeParam)
    ? (typeParam as ContentType)
    : undefined;

  const category = topic
    ? [slugToCategoryEnum(topic.slug)]
    : world
      ? world.topics.map((t) => slugToCategoryEnum(t.slug))
      : undefined;

  const baseFilters = {
    category,
    // Chon 1 nhanh con -> loc dung nhanh do; chon nhom cha -> gui slug nhom
    // (backend tu mo rong ra moi nhanh con, xem post.service.ts). Chon nhanh
    // thi bo qua nhom de 2 dieu kien khong chong nhau.
    careerCategory: fieldSlug ? [fieldSlug] : undefined,
    careerGroup: !fieldSlug && groupSlug ? groupSlug : undefined,
  };

  // Da chon 1 Content Type cu the (thanh loc duoi HomeSidebar) -> danh sach
  // don gian dung dung khuon the loai do, khong can chia hang editorial nua.
  if (contentType) {
    const posts = await listPostsAction({
      ...baseFilters,
      kind: getKindsByContentType(contentType),
      limit: SINGLE_TYPE_LIMIT,
    });
    return (
      <div className="items-start gap-6">
        <div className="min-w-0">
          <SingleTypeFeedList posts={posts} type={contentType} />
        </div>
      </div>
    );
  }

  // Chua chon Content Type -> layout editorial nhieu hang. Fetch SONG SONG,
  // MOI HANG RIENG voi dung "kind" cua no (limit 10) thay vi 1 lan fetch gop
  // 70 bai roi cat lat client-side nhu ban cu - dam bao vd "Bai viet moi
  // nhat" la 10 bai post-kind moi nhat THAT SU, khong phai "10 bai post-kind
  // tinh co roi vao trong 1 lan fetch 70 khong uu tien kind nao".
  const [
    general,
    latest,
    resources,
    projects,
    questions,
    achievements,
    journey,
    selfStatus,
  ] = await Promise.all([
      listPostsAction({ ...baseFilters, limit: GENERAL_SAMPLE_LIMIT }),
      listPostsAction({
        ...baseFilters,
        kind: LATEST_POST_KINDS,
        limit: SECTION_LIMIT,
      }),
      listPostsAction({
        ...baseFilters,
        kind: RESOURCE_KINDS,
        limit: SECTION_LIMIT,
      }),
      listPostsAction({
        ...baseFilters,
        kind: PROJECT_KINDS,
        limit: SECTION_LIMIT,
      }),
      listPostsAction({
        ...baseFilters,
        kind: ["question"],
        limit: SECTION_LIMIT,
      }),
      listPostsAction({
        ...baseFilters,
        kind: ACHIEVEMENT_KINDS,
        limit: SECTION_LIMIT,
      }),
      // Widget "hanh trinh" (hero + ke sach) - chi fetch khi biet username
      // (luon co trong thuc te, /home da bi middleware chan neu chua dang
      // nhap - null fallback chi de an toan kieu).
      username ? getMyJourneyAction() : Promise.resolve(null),
      // Gate cho WelcomeOnboardingModal (modal chao mung 3 buoc) - chi hien
      // khi onboardedAt con null.
      username ? getSelfStatusAction() : Promise.resolve(null),
    ]);

  // "Noi bat hom nay" va "Trending Topics" khong tuong ung 1-1 voi 1 kind cu
  // the nao ca (sap theo luot thich / dem theo category tren toan bo cac
  // kind) nen phai tinh tu tap mau "general" rieng, khong the ghep tu 4 hang
  // kind-filtered o tren.
  const featured = [...general]
    .sort((a, b) => b.stats.likes - a.stats.likes)
    .slice(0, 8);
  const trendingTopics = KNOWLEDGE_WORLDS.flatMap((w) =>
    w.topics.map((t) => ({
      world: w,
      topic: t,
      count: general.filter((p) => p.category === slugToCategoryEnum(t.slug))
        .length,
    })),
  )
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Query string filter HIEN TAI (topic/world/group/field, KHONG ke type) -
  // dung de dung link "Xem tat ca" o moi hang (SectionHeader.viewAllHref),
  // chi them ?type= khac nhau tuy hang, giu nguyen moi truc loc khac.
  const filterParams = new URLSearchParams();
  if (topicSlug) filterParams.set("topic", topicSlug);
  else if (worldSlug) filterParams.set("world", worldSlug);
  if (groupSlug) filterParams.set("group", groupSlug);
  if (fieldSlug) filterParams.set("field", fieldSlug);

  return (
    <div className="items-start gap-6">
      {username && selfStatus && !selfStatus.onboardedAt && (
        <WelcomeOnboardingModal
          username={username}
          name={session?.user?.name ?? username}
        />
      )}
      <div className="min-w-0">
        {journey && username && (
          <div className="mb-10 flex flex-col gap-6">
            <JourneyHero journey={journey} username={username} />
            <ChapterShelf groups={journey.groups} username={username} />
            <JourneyAchievements journey={journey} />
          </div>
        )}
        <EditorialFeed
          featured={featured}
          latest={latest}
          resources={resources}
          projects={projects}
          questions={questions}
          achievements={achievements}
          trendingTopics={trendingTopics}
          filterQuery={filterParams.toString()}
        />
      </div>
    </div>
  );
}
