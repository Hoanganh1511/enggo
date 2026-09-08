import type { FeedCategoryGroup } from "@/lib/api/feed-categories";

// 1 nhom co the la "la" (khong co category con - vd "chia sẻ chung") hoac co
// nhieu category con (vd nhom "Cong nghe" gom "Frontend"/"Backend"/...) - loc
// theo nhom nghia la loc theo TAP HOP slug cua cac category con, hoac chinh
// slug cua nhom neu no la la. Dung chung giua home-dashboard/use-article-filter.ts
// va articles-hub/NewestSection.tsx (truoc day moi noi tu viet 1 ham giong het).
export function feedGroupMemberSlugs(group: FeedCategoryGroup): string[] {
  return group.categories.length > 0 ? group.categories.map((c) => c.slug) : [group.slug];
}
