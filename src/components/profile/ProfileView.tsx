"use client";

import { useState, useSyncExternalStore } from "react";
import type { UserProfileData } from "@/content/user-profile";
import type { Post } from "@/content/home-feed-mock";
import {
  getPosts,
  subscribeFeed,
  getServerSnapshot,
} from "@/lib/discover/feed-store";
import {
  POST_KIND_META,
  type HomeTab,
} from "@/lib/discover/post-kind-meta";
import PostCard from "@/components/discover/PostCard";
import ProfileHeader from "./ProfileHeader";
import ProfileCareerSnapshot from "./ProfileCareerSnapshot";

// Tab cua profile: "all" (moi bai cua nguoi nay) + 3 nhom loc lai DUNG bang
// homeTab da dinh nghia trong post-kind-meta.ts - khong tu che bang phan loai
// thu 2 de tranh 2 nguon su that lech nhau. "saved" chi hien voi chinh chu.
type ProfileTab = "all" | Extract<HomeTab, "achievements" | "progress" | "for-it"> | "saved";

const TABS: { key: ProfileTab; label: string; selfOnly?: boolean }[] = [
  { key: "all", label: "Tất cả" },
  { key: "achievements", label: "Thành tích" },
  { key: "progress", label: "Tiến độ" },
  { key: "for-it", label: "For IT" },
  { key: "saved", label: "Đã lưu", selfOnly: true },
];

function filterForTab(posts: Post[], tab: ProfileTab): Post[] {
  if (tab === "all") return posts;
  if (tab === "saved") return posts.filter((p) => p.saved);
  return posts.filter((p) => POST_KIND_META[p.kind].homeTab === tab);
}

const ProfileView = ({ profile }: { profile: UserProfileData }) => {
  const [tab, setTab] = useState<ProfileTab>("all");
  const allPosts = useSyncExternalStore(
    subscribeFeed,
    getPosts,
    getServerSnapshot,
  );

  const visibleTabs = TABS.filter((t) => !t.selfOnly || profile.isSelf);
  const ownPosts = allPosts.filter(
    (p) => p.author.username === profile.username,
  );
  const posts = filterForTab(ownPosts, tab);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <ProfileHeader profile={profile} />

      {/* 2 cot: feed ben trai, ho so nang luc ben phai - tren man hinh hep
          thi xep doc, snapshot xuong duoi feed. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3">
              {visibleTabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`-mb-px shrink-0 cursor-pointer border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
                      active
                        ? "border-primary text-ink"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="px-4">
              {posts.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-faint">
                  Chưa có bài viết nào ở mục này.
                </p>
              ) : (
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 bottom-0 left-2.5 w-px bg-border"
                  />
                  <div className="divide-y divide-border">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <ProfileCareerSnapshot career={profile.career} />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
