import type { Post } from "@/content/home-feed-mock";

export type AchievementPost = Extract<Post, { kind: "achievement" }>;
export type MilestonePost = Extract<Post, { kind: "milestone" }>;
export type CareerUpdatePost = Extract<Post, { kind: "career-update" }>;
export type NodeCreatedPost = Extract<Post, { kind: "node-created" }>;

// 1 dong tom tat noi dung - dung cho TodayAchieversStrip (hien gon 1 hang
// ngang, khong the doc rieng tung field).
export function achievementSummary(post: Post): string {
  switch (post.kind) {
    case "achievement":
    case "milestone":
      return post.title;
    case "career-update":
      return `${post.role} tại ${post.company}`;
    case "node-created":
      return `Node mới: ${post.nodeName}`;
    default:
      return "";
  }
}

export function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

// Hint "chuoi" (streak) cho TodayAchieversStrip - CHI milestone co items[],
// tim item co label chua "lien t" (khop ca "lien tiep"/"lien tuc", xem data
// that trong seed-posts.ts: { label: 'Ngày liên tiếp', value: '100' }). Cac
// kind khac (achievement/career-update/node-created) khong co items nen
// LUON tra null - dung tinh than "neu ho co chuoi" (khong bia cho kind
// khong co data), khong phai moi bai deu hien 1 chip streak.
export function getStreakHint(
  post: Post,
): { label: string; value: string } | null {
  if (post.kind !== "milestone") return null;
  const streakItem = post.items.find((item) =>
    item.label.toLowerCase().includes("liên t"),
  );
  return streakItem ?? null;
}
