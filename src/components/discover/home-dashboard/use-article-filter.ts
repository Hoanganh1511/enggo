"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { FeedCategoryGroup } from "@/lib/api/feed-categories";
import { UNCATEGORIZED_SLUG } from "@/lib/api/feed-categories";
import type { NormalizedPost } from "@/lib/discover/normalize-post";
import { feedGroupMemberSlugs } from "@/lib/discover/feed-category-filter";

// Loc bai viet theo (1) chu de dang chon (bam tile "Browse by category") va
// (2) tu khoa tim kiem - tach rieng khoi component hien thi de test/doc doc
// duoc doc lap, va de useDeferredValue+useMemo dung 1 CHO (truoc day filter
// chay lai TRON VEN moi lan go phim vi khong memo hoa gi ca).
export function useArticleFilter(posts: NormalizedPost[], categoryTree: FeedCategoryGroup[]) {
  const [search, setSearch] = useState("");
  const [activeGroupSlug, setActiveGroupSlug] = useState<string | null>(null);
  // Go nhanh khong bi giat: filter dung gia tri "tre" hon input that, React
  // tu uu tien ve chu go truoc, filter chay sau khi ranh.
  const deferredSearch = useDeferredValue(search);

  const activeGroup = useMemo(
    () => categoryTree.find((g) => g.slug === activeGroupSlug) ?? null,
    [activeGroupSlug, categoryTree],
  );
  const activeMemberSlugs = useMemo(
    () => (activeGroup ? new Set(feedGroupMemberSlugs(activeGroup)) : null),
    [activeGroup],
  );

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeMemberSlugs && !activeMemberSlugs.has(p.categorySlug || UNCATEGORIZED_SLUG)) {
        return false;
      }
      if (!query) return true;
      return `${p.title} ${p.excerpt} ${p.categorySlug}`.toLowerCase().includes(query);
    });
  }, [posts, deferredSearch, activeMemberSlugs]);

  function toggleGroup(slug: string) {
    setActiveGroupSlug((prev) => (prev === slug ? null : slug));
  }

  return {
    search,
    setSearch,
    activeGroupSlug,
    activeGroupName: activeGroup?.name ?? null,
    toggleGroup,
    filtered,
  };
}
