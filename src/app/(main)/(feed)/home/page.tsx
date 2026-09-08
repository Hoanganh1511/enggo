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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <HomeHero
          writeHref={writeHref}
          workspaceHref={workspaceHref ?? "/home"}
        />
        <HomeArticleSection categoryTree={categoryTree} posts={posts} />
      </div>

      <aside className="space-y-5">
        <HomeRoadmapCard journey={journey} workspaceHref={workspaceHref} />
        <HomeWeeklyProgressCard
          currentStreak={currentGroup?.currentStreak ?? 0}
          totalStudyDays={currentGroup?.totalStudyDays ?? 0}
          totalUnderstood={journey.totalUnderstood}
        />
        <HomeQuoteCard quote={quote} author={author} />
        <HomeActivityCard notifications={notifications.items} />
      </aside>
    </div>
  );
}
