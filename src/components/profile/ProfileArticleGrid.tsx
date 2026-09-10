"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { NoteCard } from "@/components/discover/home-feed/NoteCard";
import { getPostTitle } from "@/components/discover/home-feed/post-display";
import {
  ProfileContentHeader,
  type ProfileContentSubTab,
} from "./ProfileContentHeader";
import type { Post } from "@/content/home-feed-mock";

type Sort = "new" | "popular";

// Thay ProfileFeedBox.tsx (list 1 cot cu) - luoi the note.com style, tai
// dung NGUYEN NoteCard.tsx. Gio tich hop them ProfileContentHeader (search
// That client-side + sub-tab Cong khai/Rieng tu THAT theo post.visibility
// khi duoc truyen subTabs - chi Bai dang truyen, xem posts/page.tsx) thay
// cho thanh heading+sort-chip don gian truoc day. "Phổ biến" van la sap
// xep lai mang posts da fetch (client-side, theo stats.likes that).
export default function ProfileArticleGrid({
  heading,
  description,
  posts,
  createHref,
  createLabel = "Tạo mới",
  subTabs,
}: {
  heading: string;
  description?: string;
  posts: Post[];
  createHref?: string;
  createLabel?: string;
  subTabs?: ProfileContentSubTab[];
}) {
  const [sort, setSort] = useState<Sort>("new");
  const [search, setSearch] = useState("");
  const [activeSubTab, setActiveSubTab] = useState(subTabs?.[0]?.key ?? "all");

  const filtered = useMemo(() => {
    let result = posts;
    if (subTabs && activeSubTab !== "all") {
      result = result.filter((p) => {
        const isPublic = !p.visibility || p.visibility === "public";
        return activeSubTab === "public" ? isPublic : !isPublic;
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => getPostTitle(p).toLowerCase().includes(q));
    }
    return result;
  }, [posts, subTabs, activeSubTab, search]);

  const sorted = useMemo(() => {
    if (sort === "new") return filtered;
    return [...filtered].sort((a, b) => b.stats.likes - a.stats.likes);
  }, [filtered, sort]);

  return (
    <div>
      <ProfileContentHeader
        title={heading}
        description={description}
        searchValue={search}
        onSearchChange={setSearch}
        createHref={createHref}
        createLabel={createLabel}
        subTabs={subTabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
      />

      {sorted.length > 1 && (
        <div className="flex justify-end gap-1.5 pb-3">
          <SortChip active={sort === "new"} onClick={() => setSort("new")} label="Mới nhất" />
          <SortChip
            active={sort === "popular"}
            onClick={() => setSort("popular")}
            label="Phổ biến"
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
            <LayoutGrid size={20} strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {search || (subTabs && activeSubTab !== "all")
                ? "Không tìm thấy nội dung phù hợp."
                : "Chưa có nội dung nào ở mục này."}
            </p>
            {!search && !(subTabs && activeSubTab !== "all") && (
              <p className="mt-1 text-xs text-ink-faint">
                Nội dung bạn tạo sẽ xuất hiện ở đây.
              </p>
            )}
          </div>
          {!search &&
            !(subTabs && activeSubTab !== "all") &&
            (createHref ? (
              <Link
                href={createHref}
                className="mt-1 flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
              >
                <Plus size={14} strokeWidth={2.5} />
                {createLabel}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Sắp có"
                className="mt-1 flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full bg-surface-muted px-4 text-sm font-semibold text-ink-faint"
              >
                <Plus size={14} strokeWidth={2.5} />
                {createLabel}
              </button>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <NoteCard
              key={post.id}
              post={post}
              className="w-full"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SortChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ease-out ${
        active
          ? "bg-primary text-on-primary"
          : "border border-border text-ink-muted hover:bg-hover-bg"
      }`}
    >
      {label}
    </button>
  );
}
