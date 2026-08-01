import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  Image as ImageIcon,
  Images,
  Video,
  FileText,
  Link2,
  BookOpen,
  StickyNote,
  FolderGit2,
  Trophy,
  Milestone,
  HelpCircle,
  BarChart3,
  Briefcase,
  Sparkles,
  GitBranch,
  Layers,
  History,
  Code2,
  Lightbulb,
  Wrench,
  FlaskConical,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import type { Post } from "@/content/home-feed-mock";

// Content Type dieu huong tren cung trang Home (xem HomeLayoutShell.tsx) -
// truc DOC LAP voi Topic (knowledge-worlds.ts): Content Type la "dinh dang
// noi dung" (Post/Resource/Project/...), Topic la "chu de" (Frontend/AI/...).
// 2 truc nay ket hop dong thoi qua query param (?type=&topic=) - xem
// app/(main)/home/page.tsx.
export type ContentType =
  | "post"
  | "resource"
  | "project"
  | "question"
  | "achievement"
  | "progress"
  | "event"
  | "vote";

export const CONTENT_TYPES: { key: ContentType; label: string }[] = [
  { key: "post", label: "Post" },
  { key: "resource", label: "Resource" },
  { key: "project", label: "Project" },
  { key: "question", label: "Question" },
  { key: "achievement", label: "Achievement" },
  { key: "progress", label: "Progress" },
  { key: "event", label: "Event" },
  { key: "vote", label: "Vote" },
];

type PostKindMeta = {
  icon: LucideIcon;
  accent: string;
  label: string;
  contentType: ContentType;
};

// Icon + mau rieng cho TUNG kind - hien nhu 1 marker nho canh avatar
// (PostCard.tsx) de nhan ra loai bai viet ngay ca khi khong doc noi dung,
// doc lap voi icon/accent rieng cua tung post (vd project-update/resource da
// co icon/accent trong data mock, nhung marker nay luon dung mau/icon THEO
// KIND de nhat quan khi luot feed).
export const POST_KIND_META: Record<Post["kind"], PostKindMeta> = {
  text: { icon: MessageSquare, accent: "#64748b", label: "Bài viết", contentType: "post" },
  image: { icon: ImageIcon, accent: "#0ea5e9", label: "Ảnh", contentType: "post" },
  gallery: { icon: Images, accent: "#0ea5e9", label: "Ảnh", contentType: "post" },
  video: { icon: Video, accent: "#ef4444", label: "Video", contentType: "post" },
  idea: { icon: Lightbulb, accent: "#facc15", label: "Idea", contentType: "post" },

  question: { icon: HelpCircle, accent: "#a855f7", label: "Question", contentType: "question" },

  event: { icon: CalendarDays, accent: "#ec4899", label: "Event", contentType: "event" },

  achievement: { icon: Trophy, accent: "#f59e0b", label: "Achievement", contentType: "achievement" },
  milestone: { icon: Milestone, accent: "#22c55e", label: "Milestone", contentType: "achievement" },
  "career-update": { icon: Briefcase, accent: "#0ea5e9", label: "Career", contentType: "achievement" },

  "skill-report": { icon: ClipboardCheck, accent: "#10b981", label: "Báo cáo", contentType: "progress" },
  "skill-update": { icon: Sparkles, accent: "#14b8a6", label: "Skill", contentType: "progress" },
  "timeline-event": { icon: History, accent: "#94a3b8", label: "Timeline", contentType: "progress" },

  "project-update": { icon: FolderGit2, accent: "#6366f1", label: "Project Update", contentType: "project" },
  "node-created": { icon: GitBranch, accent: "#10b981", label: "Node", contentType: "project" },
  "knowledge-block": { icon: Layers, accent: "#38bdf8", label: "Knowledge", contentType: "project" },
  experiment: { icon: FlaskConical, accent: "#f97316", label: "Experiment", contentType: "project" },

  note: { icon: StickyNote, accent: "#eab308", label: "Note", contentType: "resource" },
  file: { icon: FileText, accent: "#64748b", label: "File", contentType: "resource" },
  link: { icon: Link2, accent: "#38bdf8", label: "Link", contentType: "resource" },
  resource: { icon: BookOpen, accent: "#8b5cf6", label: "Resource", contentType: "resource" },
  "code-snippet": { icon: Code2, accent: "#6366f1", label: "Code", contentType: "resource" },
  tutorial: { icon: Wrench, accent: "#38bdf8", label: "Tutorial", contentType: "resource" },

  poll: { icon: BarChart3, accent: "#a855f7", label: "Poll", contentType: "vote" },
};

// Danh sach kind (kebab-case, khop PostKindApi o backend) thuoc 1 Content
// Type - dung de gui len API loc (?kind=text,image,...), xem list-posts.ts.
export function getKindsByContentType(type: ContentType): Post["kind"][] {
  return (Object.keys(POST_KIND_META) as Post["kind"][]).filter(
    (kind) => POST_KIND_META[kind].contentType === type,
  );
}
