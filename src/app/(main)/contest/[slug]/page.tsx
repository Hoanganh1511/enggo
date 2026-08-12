import Image from "next/image";
import { notFound } from "next/navigation";
import { Trophy, CalendarDays, FileText } from "lucide-react";

import {
  getContest,
  getContestPosts,
  getContestRelatedPosts,
  type ContestTab,
} from "@/lib/api/contests";
import { NoteCard } from "@/components/discover/home-feed/NoteCard";
import { ContestTabs } from "@/components/discover/contest/ContestTabs";
import { RelatedPostsPanel } from "@/components/discover/contest/RelatedPostsPanel";
import { CONTEST_ACCENT } from "@/components/discover/contest/contest-style";
import { hexToRgba } from "@/lib/utils";

const TABS: ContestTab[] = ["popular", "trending", "latest"];

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Async Server Component + notFound() theo dung mau cac trang chi tiet khac
// (vd w/[workspaceId]/nodes/[nodeId]). Tab doc tu query param nen doi tab la
// dieu huong that -> fetch lai dung thu tu tu backend, khong sap lai o client.
export default async function ContestDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: ContestTab = TABS.includes(tabParam as ContestTab)
    ? (tabParam as ContestTab)
    : "popular";

  const contest = await getContest(slug).catch(() => null);
  if (!contest) notFound();

  const [posts, related] = await Promise.all([
    getContestPosts(slug, tab).catch(() => []),
    getContestRelatedPosts(slug).catch(() => []),
  ]);

  const isContest = contest.kind === "CONTEST";

  return (
    // Tu them px-4 pt-4 - trang nay khong con nam trong HomeLayoutShell (da
    // chuyen /contest ra khoi (main)/(feed), khong con sidebar), phai tu lo
    // padding.
    <div className="flex flex-col gap-6 px-4 pt-4 pb-10">
      {/* Anh bia chu de - overlay gradient theo accent de chu luon doc duoc
          du anh sang hay toi. */}
      <div className="relative h-44 w-full overflow-hidden rounded-lg bg-surface-muted sm:h-56">
        {contest.coverImageUrl && (
          <Image
            src={contest.coverImageUrl}
            alt={contest.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${hexToRgba(CONTEST_ACCENT, 0.85)}, ${hexToRgba(CONTEST_ACCENT, 0.15)})`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
          <span className="w-fit rounded-sm bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {isContest ? "Cuộc thi" : "Chủ đề"}
          </span>
          <h1 className="text-2xl leading-tight font-bold text-white">
            #{contest.hashtag}
          </h1>
          {contest.partnerName && (
            <p className="text-xs text-white/85 italic">
              với {contest.partnerName}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-ink-muted">
          {contest.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <FileText size={13} strokeWidth={2} className="text-ink-faint" />
            {contest.postCount.toLocaleString("vi-VN")} bài viết
          </span>
          {contest.prize && (
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={13} strokeWidth={2} className="text-warning" />
              {contest.prize}
            </span>
          )}
          {contest.deadline && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                size={13}
                strokeWidth={2}
                className="text-ink-faint"
              />
              Hạn: {formatDate(contest.deadline)}
            </span>
          )}
        </div>
      </div>

      {/* 75% tab + danh sach bai / 25% bai lien quan (xep doc o man hep). */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:w-3/4">
          <ContestTabs slug={slug} active={tab} />
          {posts.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-faint">
              Chưa có bài viết nào trong chủ đề này.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 gap-y-6">
              {posts.map((post) => (
                <NoteCard key={post.id} post={post} className="w-full" />
              ))}
            </div>
          )}
        </div>

        <RelatedPostsPanel posts={related} />
      </div>
    </div>
  );
}
