"use client";

import { useMemo } from "react";
import { Hammer, Brain, Bot, Palette, Rocket, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import {
  KNOWLEDGE_WORLDS,
  slugToCategoryEnum,
} from "@/lib/discover/knowledge-worlds";
import { SectionHeader } from "./SectionHeader";
import { HorizontalScroller } from "./HorizontalScroller";
import { NoteCard } from "./NoteCard";
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

// Nhom kind CUC BO cho tung section editorial - DOC LAP voi ContentType cua
// post-kind-meta.ts (dung cho thanh loc Content Type, khong duoc sua) vi
// muc dich khac nhau: o day "Note" tach rieng khoi "Resource" (dung cho
// Latest Posts, giong tinh chat van ban ca nhan hon la tu lieu tham khao).
const LATEST_POST_KINDS = new Set<Post["kind"]>([
  "text",
  "image",
  "gallery",
  "video",
  "idea",
  "note",
]);
const RESOURCE_KINDS = new Set<Post["kind"]>([
  "resource",
  "file",
  "link",
  "code-snippet",
  "tutorial",
]);
const PROJECT_KINDS = new Set<Post["kind"]>([
  "project-update",
  "node-created",
  "knowledge-block",
  "experiment",
]);
const ACHIEVEMENT_KINDS = new Set<Post["kind"]>([
  "achievement",
  "milestone",
  "career-update",
]);

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface-muted ${className}`} />;
}

// Layout editorial cho trang Home khi KHONG co Content Type nao dang chon -
// thay the MasonryFeed 1 luoi lien tuc bang nhieu section doc lap. MOI
// section (ke ca "Latest Posts", truoc day dung LatestPostRow dang danh sach
// chu - da bo theo yeu cau dong bo 100%) deu dung CHUNG 1 khuon the NoteCard
// (anh lon, gan khong vien, caption gon), chi khac tap kind duoc dua vao.
// Section nao khong co bai nao thi AN HAN, khong hien tieu de rong.
export function EditorialFeed({
  posts,
  loading,
}: {
  posts: Post[];
  loading: boolean;
}) {
  const { featured, latest, resources, projects, questions, achievements, trendingTopics } =
    useMemo(() => {
      const featured = [...posts]
        .sort((a, b) => b.stats.likes - a.stats.likes)
        .slice(0, 8);
      const latest = posts.filter((p) => LATEST_POST_KINDS.has(p.kind));
      const resources = posts.filter((p) => RESOURCE_KINDS.has(p.kind));
      const projects = posts.filter((p) => PROJECT_KINDS.has(p.kind));
      const questions = posts.filter((p) => p.kind === "question");
      const achievements = posts.filter((p) => ACHIEVEMENT_KINDS.has(p.kind));

      // Trending Topics khong phai post - dem so bai co category khop moi
      // Topic trong tap posts da fetch (uoc luong trong pham vi trang dang
      // xem, giong cach cac noi khac trong app da chap nhan gioi han nay).
      const trendingTopics = KNOWLEDGE_WORLDS.flatMap((world) =>
        world.topics.map((topic) => ({
          world,
          topic,
          count: posts.filter(
            (p) => p.category === slugToCategoryEnum(topic.slug),
          ).length,
        })),
      )
        .filter((t) => t.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return { featured, latest, resources, projects, questions, achievements, trendingTopics };
    }, [posts]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        <SkeletonBlock className="h-64 w-full" />
        <SkeletonBlock className="h-40 w-full" />
        <SkeletonBlock className="h-80 w-full" />
      </div>
    );
  }

  if (posts.length === 0) {
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
            {featured.map((post) => (
              <NoteCard key={post.id} post={post} />
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
          <SectionHeader title="Tài nguyên đề xuất" />
          <HorizontalScroller>
            {resources.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {questions.length > 0 && (
        <section>
          <SectionHeader title="Câu hỏi" />
          <HorizontalScroller>
            {questions.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <SectionHeader title="Dự án" />
          <HorizontalScroller>
            {projects.map((post) => (
              <NoteCard key={post.id} post={post} />
            ))}
          </HorizontalScroller>
        </section>
      )}

      {achievements.length > 0 && (
        <section>
          <SectionHeader title="Thành tích" />
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
