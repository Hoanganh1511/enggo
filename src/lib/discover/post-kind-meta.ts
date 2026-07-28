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

// 2 nhom noi dung cho 2 cot cua feed (xem FeedColumns.tsx): "personal" la
// hoat dong/chia se ca nhan (post thuong, cau hoi, thanh tich...), "resource"
// la noi dung mang tinh tham khao/tu lieu (file, link, tutorial, project
// update...). Dung de chia POSTS thanh 2 cot thay vi hien trung lap ca 2 ben
// nhu truoc (xem HomeLayoutShell.tsx).
export type PostColumnGroup = "personal" | "resource";

// Tab dieu huong tren cung trang Home (xem HomeLayoutShell.tsx) - THAY the
// bo 3 tab cu "For you/Following/Trending" (loc theo trang thai follow/diem
// tuong tac, khong lien quan "loai" post) bang 5 tab loc THANG theo "kind":
// "posts" = chia se thuong ngay, "achievements" = thanh tich/cot moc,
// "progress" = cap nhat tien do dang lam do, "for-it" = tu lieu/kien thuc ky
// thuat, "vote" = binh chon.
export type HomeTab = "posts" | "achievements" | "progress" | "for-it" | "vote";

type PostKindMeta = {
  icon: LucideIcon;
  accent: string;
  label: string;
  group: PostColumnGroup;
  homeTab: HomeTab;
};

// Icon + mau rieng cho TUNG kind - hien nhu 1 marker nho canh avatar
// (PostCard.tsx) de nhan ra loai bai viet ngay ca khi khong doc noi dung,
// doc lap voi icon/accent rieng cua tung post (vd project-update/resource da
// co icon/accent trong data mock, nhung marker nay luon dung mau/icon THEO
// KIND de nhat quan khi luot feed).
export const POST_KIND_META: Record<Post["kind"], PostKindMeta> = {
  text: { icon: MessageSquare, accent: "#64748b", label: "Bài viết", group: "personal", homeTab: "posts" },
  image: { icon: ImageIcon, accent: "#0ea5e9", label: "Ảnh", group: "personal", homeTab: "posts" },
  gallery: { icon: Images, accent: "#0ea5e9", label: "Ảnh", group: "personal", homeTab: "posts" },
  video: { icon: Video, accent: "#ef4444", label: "Video", group: "personal", homeTab: "posts" },
  question: { icon: HelpCircle, accent: "#a855f7", label: "Question", group: "personal", homeTab: "posts" },
  idea: { icon: Lightbulb, accent: "#facc15", label: "Idea", group: "personal", homeTab: "posts" },
  event: { icon: CalendarDays, accent: "#ec4899", label: "Event", group: "resource", homeTab: "posts" },

  achievement: { icon: Trophy, accent: "#f59e0b", label: "Achievement", group: "personal", homeTab: "achievements" },
  milestone: { icon: Milestone, accent: "#22c55e", label: "Milestone", group: "personal", homeTab: "achievements" },
  "career-update": { icon: Briefcase, accent: "#0ea5e9", label: "Career", group: "personal", homeTab: "achievements" },
  "node-created": { icon: GitBranch, accent: "#10b981", label: "Node", group: "personal", homeTab: "achievements" },

  "skill-report": { icon: ClipboardCheck, accent: "#10b981", label: "Báo cáo", group: "personal", homeTab: "progress" },
  "skill-update": { icon: Sparkles, accent: "#14b8a6", label: "Skill", group: "personal", homeTab: "progress" },
  "timeline-event": { icon: History, accent: "#94a3b8", label: "Timeline", group: "personal", homeTab: "progress" },
  "project-update": { icon: FolderGit2, accent: "#6366f1", label: "Project Update", group: "resource", homeTab: "progress" },
  "knowledge-block": { icon: Layers, accent: "#38bdf8", label: "Knowledge", group: "resource", homeTab: "progress" },
  experiment: { icon: FlaskConical, accent: "#f97316", label: "Experiment", group: "resource", homeTab: "progress" },

  note: { icon: StickyNote, accent: "#eab308", label: "Note", group: "personal", homeTab: "for-it" },
  file: { icon: FileText, accent: "#64748b", label: "File", group: "resource", homeTab: "for-it" },
  link: { icon: Link2, accent: "#38bdf8", label: "Link", group: "resource", homeTab: "for-it" },
  resource: { icon: BookOpen, accent: "#8b5cf6", label: "Resource", group: "resource", homeTab: "for-it" },
  "code-snippet": { icon: Code2, accent: "#6366f1", label: "Code", group: "resource", homeTab: "for-it" },
  tutorial: { icon: Wrench, accent: "#38bdf8", label: "Tutorial", group: "resource", homeTab: "for-it" },

  poll: { icon: BarChart3, accent: "#a855f7", label: "Poll", group: "personal", homeTab: "vote" },
};

// Chia mang post thanh 2 cot theo group o tren, GIU NGUYEN thu tu tuong doi
// trong tung cot (khong xao tron/interleave lai theo thoi gian).
export function splitPostsIntoColumns(posts: Post[]): {
  left: Post[];
  right: Post[];
} {
  const left: Post[] = [];
  const right: Post[] = [];
  for (const post of posts) {
    if (POST_KIND_META[post.kind].group === "personal") {
      left.push(post);
    } else {
      right.push(post);
    }
  }
  return { left, right };
}

// Loc theo tab tren cung trang Home (xem cac page.tsx trong app/(main)/home/).
export function filterPostsByHomeTab(posts: Post[], tab: HomeTab): Post[] {
  return posts.filter((post) => POST_KIND_META[post.kind].homeTab === tab);
}
