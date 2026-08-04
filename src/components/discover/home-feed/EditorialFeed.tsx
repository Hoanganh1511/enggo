import { Hammer, Brain, Bot, Palette, Rocket, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import type { Topic, KnowledgeWorld } from "@/lib/discover/knowledge-worlds";
import { SectionHeader } from "./SectionHeader";
import { HorizontalScroller } from "./HorizontalScroller";
import { NoteCard, NoteCardSkeleton } from "./NoteCard";
import { TrendingTopicCard } from "./TrendingTopicCard";
import { TOPIC_DESCRIPTION } from "./topic-descriptions";

// Icon + mau rieng cho tung Knowledge World - CHI dung o day de ve section
// "Trending Topics". Trung y nghia voi WORLD_ICON noi bo cua HomeCategoryBar.tsx
// nhung KHONG import chung duoc (file do khong export map nay, va nam ngoai
// pham vi duoc phep sua - "chi doi vung feed").
const WORLD_ICON: Record<string, LucideIcon> = {
  build: Hammer,
  think: Brain,
  ai: Bot,
  create: Palette,
  career: Rocket,
  business: Briefcase,
};
const WORLD_ACCENT: Record<string, string> = {
  build: "#0ea5e9",
  think: "#8b5cf6",
  ai: "#ec4899",
  create: "#f59e0b",
  career: "#10b981",
  business: "#f43f5e",
};

// Skeleton mo phong DUNG hinh dang thuc te se hien ra (nhieu section, moi
// section 1 hang carousel the NoteCardSkeleton) - export de home/loading.tsx
// (route-level Suspense fallback) dung lai, thay vi 3 block chu nhat chung
// chung truoc day khong khop layout section+carousel hien tai.
export function SectionSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <section>
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-surface-muted" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: cards }).map((_, i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

type TrendingTopicEntry = {
  world: KnowledgeWorld;
  topic: Topic;
  count: number;
};

// Layout editorial cho trang Home khi KHONG co Content Type nao dang chon -
// thay the MasonryFeed 1 luoi lien tuc bang nhieu section doc lap, moi
// section dung CHUNG 1 khuon the NoteCard (anh lon, gan khong vien, caption
// gon) theo tinh than note.com. Server Component thuan (KHONG "use client") -
// moi hang da duoc home/page.tsx fetch RIENG voi dung "kind" cua no (limit 10,
// xem quyet dinh 2026-08-03 trong docs/engineering-log.md), component nay chi
// con nhiem vu trinh bay, khong con tu filter/useMemo tu 1 mang gop 70 bai
// nhu ban cu. "viewAllHref" (query string filter hien tai, chi them ?type=)
// dan sang SingleTypeFeedList xem day du thay vi ket lai o 10 bai co dinh.
export function EditorialFeed({
  featured,
  latest,
  resources,
  projects,
  questions,
  achievements,
  trendingTopics,
  filterQuery,
}: {
  featured: Post[];
  latest: Post[];
  resources: Post[];
  projects: Post[];
  questions: Post[];
  achievements: Post[];
  trendingTopics: TrendingTopicEntry[];
  filterQuery: string;
}) {
  const viewAllHref = (type: string) =>
    `/home?${filterQuery ? `${filterQuery}&` : ""}type=${type}`;

  const isEmpty =
    featured.length === 0 &&
    latest.length === 0 &&
    resources.length === 0 &&
    projects.length === 0 &&
    questions.length === 0 &&
    achievements.length === 0 &&
    trendingTopics.length === 0;

  if (isEmpty) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        Chưa có bài viết nào phù hợp.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {featured.length > 0 && (
        <section>
          <SectionHeader title="Nổi bật hôm nay" />
          <HorizontalScroller>
            {featured.map((post, i) => (
              // priority chi cho vai the dau - day la ung vien LCP cua trang
              // (section dau tien, nam trong viewport ban dau tren desktop
              // khong can cuon). Xem quyet dinh 2026-08-03 trong engineering-log.md.
              <NoteCard key={post.id} post={post} priority={i < 6} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {trendingTopics.length > 0 && (
        <section>
          <SectionHeader
            title="Chủ đề đang được quan tâm"
            subtitle="Khám phá theo từng lĩnh vực kiến thức"
          />
          <HorizontalScroller>
            {trendingTopics.map(({ world, topic, count }) => (
              <TrendingTopicCard
                key={topic.slug}
                slug={topic.slug}
                label={topic.label}
                worldLabel={world.label}
                description={TOPIC_DESCRIPTION[topic.slug] ?? world.label}
                count={count}
                icon={WORLD_ICON[world.slug]}
                accent={WORLD_ACCENT[world.slug]}
              />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {latest.length > 0 && (
        <section>
          <SectionHeader
            title="Bài viết mới nhất"
            subtitle="Cập nhật và chia sẻ mới nhất từ cộng đồng"
            viewAllHref={viewAllHref("post")}
          />
          <HorizontalScroller>
            {latest.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {resources.length > 0 && (
        <section>
          <SectionHeader title="Tài nguyên đề xuất" viewAllHref={viewAllHref("resource")} />
          <HorizontalScroller>
            {resources.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {questions.length > 0 && (
        <section>
          <SectionHeader title="Câu hỏi" viewAllHref={viewAllHref("question")} />
          <HorizontalScroller>
            {questions.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <SectionHeader title="Dự án" viewAllHref={viewAllHref("project")} />
          <HorizontalScroller>
            {projects.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {achievements.length > 0 && (
        <section>
          <SectionHeader title="Thành tích" viewAllHref={viewAllHref("achievement")} />
          <HorizontalScroller>
            {achievements.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}
    </div>
  );
}
