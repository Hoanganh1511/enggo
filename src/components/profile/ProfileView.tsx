"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { UserProfileData } from "@/content/user-profile";
import type { Post } from "@/content/home-feed-mock";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import PostCard from "@/components/discover/PostCard";
import ProfileHeader from "./ProfileHeader";
import ProfileNav, { type ProfileTab } from "./ProfileNav";
import ProfileFooter from "./ProfileFooter";
import {
  AboutCard,
  BadgesCard,
  CollectionsCard,
  ConnectionsCard,
  StatsCard,
} from "./ProfileSideCards";

const TAB_HEADING: Record<ProfileTab, string> = {
  home: "Bài đăng mới nhất",
  posts: "Tất cả bài đăng",
  playlists: "Danh sách phát",
  collections: "Bộ sưu tập",
  likes: "Bài viết đã thích",
  history: "Lịch sử xem",
};

// Loc bai theo tab + tu khoa tim kiem trong trang. "playlists"/"collections"
// chua co du lieu that nen tra ve rong (hien trang thai trong, khong gia lap).
function selectPosts(
  posts: Post[],
  profile: UserProfileData,
  tab: ProfileTab,
  query: string,
): Post[] {
  const own = posts.filter((p) => p.author.username === profile.username);

  let base: Post[];
  switch (tab) {
    case "home":
      base = own.slice(0, 10);
      break;
    case "posts":
      base = own;
      break;
    case "likes":
      base = posts.filter((p) => p.liked);
      break;
    case "history":
      base = posts.slice(0, 8);
      break;
    default:
      base = [];
  }

  const q = query.trim().toLowerCase();
  if (!q) return base;
  return base.filter((p) => JSON.stringify(p).toLowerCase().includes(q));
}

const ProfileView = ({ profile }: { profile: UserProfileData }) => {
  const [tab, setTab] = useState<ProfileTab>("home");
  const [query, setQuery] = useState("");
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );

  const posts = useMemo(
    () => selectPosts(allPosts, profile, tab, query),
    [allPosts, profile, tab, query],
  );

  return (
    <div className="flex flex-col">
      <ProfileHeader profile={profile} />
      <ProfileNav
        active={tab}
        onChange={setTab}
        isSelf={profile.isSelf}
        query={query}
        onQueryChange={setQuery}
      />

      {/* Than trang: feed ben trai, cac the thong tin ben phai */}
      <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-bold text-ink">{TAB_HEADING[tab]}</h2>
            </div>

            <div className="px-4">
              {posts.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-faint">
                  {query.trim()
                    ? "Không tìm thấy nội dung phù hợp."
                    : "Chưa có nội dung nào ở mục này."}
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
          <StatsCard career={profile.career} />
          <AboutCard paragraphs={profile.bioLong} links={profile.links} />
          <BadgesCard badges={profile.badges} total={profile.badgeCount} />
          <ConnectionsCard
            title="Đang theo dõi"
            count={profile.followingCount}
            users={profile.followingPreview}
          />
          <ConnectionsCard
            title="Người theo dõi"
            count={profile.followerCount}
            users={profile.followerPreview}
          />
          <CollectionsCard collections={profile.collections} />
        </aside>
      </div>

      <ProfileFooter displayName={profile.displayName} />
    </div>
  );
};

export default ProfileView;
