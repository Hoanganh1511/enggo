import type { Post } from "@/content/home-feed-mock";

// Helper hien thi dung chung cho cac card editorial moi - nhieu kind (text/
// idea/question/poll/...) KHONG co field "title" rieng (xem home-feed-mock.ts),
// nen can suy ra 1 dong tieu de ngan gon tu content/cac field dac thu thay vi
// bat moi noi tu xu ly rieng.
export function getPostTitle(post: Post): string {
  if ("title" in post && post.title) return post.title;
  switch (post.kind) {
    case "project-update":
      return post.project;
    case "poll":
      return post.question;
    case "career-update":
      return `${post.role} tại ${post.company}`;
    case "skill-update":
      return post.skill;
    case "node-created":
      return post.nodeName;
    case "knowledge-block":
      return post.block;
    case "timeline-event":
      return post.event;
    case "code-snippet":
      return post.title ?? post.language;
    default:
      break;
  }
  if ("content" in post && post.content) {
    const firstLine = post.content.split("\n")[0];
    return firstLine.length > 90 ? `${firstLine.slice(0, 90)}…` : firstLine;
  }
  return "Bài đăng";
}

// Anh that duy nhat lay tu chinh du lieu post (image/gallery/video) - cac
// kind khac (resource/project/topic...) khong co anh that, xu ly rieng o
// ContentTile.tsx (fallback gradient+icon).
export function getPostImageUrl(post: Post): string | undefined {
  if (post.kind === "image") return post.image.url;
  if (post.kind === "gallery") return post.images[0]?.url;
  if (post.kind === "video") return post.video.thumbnailUrl;
  return undefined;
}
