import { auth } from "@/auth";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getMyJourneyAction } from "@/actions/knowledge-groups/get-my-journey";
import { listNotificationsAction } from "@/actions/notifications/list-notifications";
import { normalizePost } from "@/lib/discover/normalize-post";
import { pickDailyQuote } from "@/components/discover/home-dashboard/home-quotes";
import { HomeHero } from "@/components/discover/home-dashboard/HomeHero";
import { HomeArticleSection } from "@/components/discover/home-dashboard/HomeArticleSection";
import { HomeRoadmapCard } from "@/components/discover/home-dashboard/HomeRoadmapCard";
import { HomeWeeklyProgressCard } from "@/components/discover/home-dashboard/HomeWeeklyProgressCard";
import { HomeMobileQuickPanels } from "@/components/discover/home-dashboard/HomeMobileQuickPanels";
import { HomeQuoteCard } from "@/components/discover/home-dashboard/HomeQuoteCard";
import { HomeActivityCard } from "@/components/discover/home-dashboard/HomeActivityCard";

// /home - port giao dien "knowledge dashboard" tu source
// knowledge-dashboard-nextjs.zip. Day LA trang /home chinh thuc (khong con
// HomeHero/HomeFeatureGrid/HomePrinciples/HomeSystemSection cu - da xoa),
// sidebar da chuyen sang layout.tsx cung cap. Composed truc tiep tu cac
// Server Component nho (Hero/Roadmap/WeeklyProgress/Quote/Activity - khong
// "use client", khong dinh JS) + 1 island DUY NHAT can tuong tac
// (HomeArticleSection - category filter + search, xem component do).
export default async function HomeFeedPage() {
  const session = await auth();
  const username = session?.username ?? null;

  const [categoryTree, rawPosts, journey, notifications] = await Promise.all([
    getFeedCategoryTree().catch(() => []),
    listPostsAction({ limit: 48 }).catch(() => []),
    getMyJourneyAction().catch(() => ({
      groups: [],
      currentGroupId: null,
      totalUnderstood: 0,
    })),
    listNotificationsAction("all").catch(() => ({
      items: [],
      nextCursor: null,
    })),
  ]);

  const posts = rawPosts.map(normalizePost);
  const currentGroup = journey.groups.find(
    (g) => g.id === journey.currentGroupId,
  );
  const writeHref = username
    ? currentGroup
      ? `/workspace/${username}/${currentGroup.workspaceId}`
      : `/workspace/${username}`
    : "/home";
  const workspaceHref = username ? `/workspace/${username}` : null;
  const { quote, author } = pickDailyQuote();

  // Dung 1 element cho ca 2 cho (aside desktop + drawer mobile) - render 2
  // lan (1 lan bi `hidden` qua CSS tren mobile) nhung re, khong fetch gi
  // them, chi tranh lap props inline 2 noi.
  const roadmapCard = <HomeRoadmapCard journey={journey} workspaceHref={workspaceHref} />;
  const weeklyProgressCard = (
    <HomeWeeklyProgressCard
      currentStreak={currentGroup?.currentStreak ?? 0}
      totalStudyDays={currentGroup?.totalStudyDays ?? 0}
      totalUnderstood={journey.totalUnderstood}
    />
  );

  return (
    // lg:-mr-10 huy padding phai cua container chung ((feed)/layout.tsx) -
    // rieng /home liet sat vien phai man hinh tu lg tro len (yeu cau rieng,
    // khac /articles va /tracking van giu padding deu 2 ben).
    <div className="grid grid-cols-1 gap-6 lg:-mr-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <HomeHero
          writeHref={writeHref}
          workspaceHref={workspaceHref ?? "/home"}
        />
        <HomeArticleSection categoryTree={categoryTree} posts={posts} />
      </div>

      <aside className="space-y-5">
        {/* <1024px: 2 card nay thu gon thanh nut fixed goc duoi-phai + drawer
            (xem HomeMobileQuickPanels ben duoi), khong hien inline nua. */}
        <div className="hidden lg:block">{roadmapCard}</div>
        <div className="hidden lg:block">{weeklyProgressCard}</div>
        <HomeQuoteCard quote={quote} author={author} />
        <HomeActivityCard notifications={notifications.items} />
      </aside>

      <HomeMobileQuickPanels roadmap={roadmapCard} weeklyProgress={weeklyProgressCard} />
    </div>
  );
}
