import type { FeedCategoryGroup } from "@/lib/api/feed-categories";

// 1 nhom co the la "la" (khong co category con - vd "chia sẻ chung") hoac co
// nhieu category con (vd nhom "Cong nghe" gom "Frontend"/"Backend"/...) - loc
// theo nhom nghia la loc theo TAP HOP slug cua cac category con, hoac chinh
// slug cua nhom neu no la la.
export function feedGroupMemberSlugs(group: FeedCategoryGroup): string[] {
  return group.categories.length > 0 ? group.categories.map((c) => c.slug) : [group.slug];
}
