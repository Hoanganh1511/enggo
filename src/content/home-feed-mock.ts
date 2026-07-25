import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Boxes,
  Layers,
  Cloud,
  Database,
  Code2,
  Trophy,
  Wrench,
  FolderGit2,
  BookOpen,
} from "lucide-react";

// Trang chu (Home feed) - TOAN BO du lieu la MOCK CUNG, chua noi API/DB nao.
// Khi lam feed that se thay file nay bang fetch tu backend.
//
// Post la discriminated union theo "kind" - MOI kind co body rieng (xem
// src/components/discover/post-bodies/) thay vi 1 "attachment" chung chung
// cho tat ca: Text/Image/Gallery/Video/File/Link/Resource/Note/ProjectUpdate/
// Achievement/Milestone/Question/Poll/CareerUpdate/SkillUpdate/NodeCreated/
// KnowledgeBlock/TimelineEvent deu co dang trinh bay rieng, nhan dien duoc
// ngay ca khi khong doc text.
type Author = {
  name: string;
  username: string;
  verified: boolean;
  avatarUrl: string;
};

type PostCommon = {
  id: string;
  author: Author;
  timeAgo: string;
  stats: { likes: number; comments: number; reposts: number };
  liked?: boolean;
  saved?: boolean;
  following: boolean;
};

export type ImageAsset = { url: string; alt: string };

export type Post =
  | (PostCommon & { kind: "text"; content: string })
  | (PostCommon & { kind: "image"; content?: string; image: ImageAsset })
  | (PostCommon & { kind: "gallery"; content?: string; images: ImageAsset[] })
  | (PostCommon & {
      kind: "video";
      content?: string;
      video: { thumbnailUrl: string; duration: string };
    })
  | (PostCommon & {
      kind: "file";
      content?: string;
      file: { name: string; ext: string; size: string };
    })
  | (PostCommon & {
      kind: "link";
      content?: string;
      link: {
        domain: string;
        title: string;
        description: string;
        icon: LucideIcon;
        accent: string;
      };
    })
  | (PostCommon & {
      kind: "resource";
      content?: string;
      resource: {
        title: string;
        kindLabel: string;
        rating: number;
        icon: LucideIcon;
        accent: string;
      };
    })
  | (PostCommon & {
      kind: "note";
      title: string;
      content: string;
      tag?: string;
    })
  | (PostCommon & {
      kind: "project-update";
      project: string;
      version: string;
      changes: string[];
      icon: LucideIcon;
      accent: string;
    })
  | (PostCommon & {
      kind: "achievement";
      title: string;
      description: string;
      icon: LucideIcon;
      accent: string;
    })
  | (PostCommon & {
      kind: "milestone";
      content?: string;
      title: string;
      items: { label: string; value: string }[];
    })
  | (PostCommon & { kind: "question"; content: string })
  | (PostCommon & {
      kind: "poll";
      question: string;
      options: { label: string; votes: number }[];
    })
  | (PostCommon & { kind: "career-update"; company: string; role: string })
  | (PostCommon & {
      kind: "skill-update";
      skill: string;
      level: number;
      maxLevel: number;
    })
  | (PostCommon & {
      kind: "node-created";
      nodeName: string;
      blockName: string;
    })
  | (PostCommon & {
      kind: "knowledge-block";
      block: string;
      progress: number;
      icon: LucideIcon;
      accent: string;
    })
  | (PostCommon & { kind: "timeline-event"; event: string })
  | (PostCommon & {
      kind: "code-snippet";
      language: string;
      title?: string;
      code: string;
    })
  | (PostCommon & { kind: "idea"; content: string })
  | (PostCommon & {
      kind: "tutorial";
      title: string;
      description: string;
      steps: number;
      icon: LucideIcon;
      accent: string;
    })
  | (PostCommon & {
      kind: "experiment";
      title: string;
      hypothesis: string;
      result: string;
    })
  | (PostCommon & {
      kind: "event";
      title: string;
      when: string;
      location?: string;
    });

const LUCAS: Author = {
  name: "Lucas Trần",
  username: "lucas.dev",
  verified: true,
  avatarUrl: "https://i.pravatar.cc/150?img=12",
};
const MINH: Author = {
  name: "Minh Trần",
  username: "minh.engineer",
  verified: true,
  avatarUrl: "https://i.pravatar.cc/150?img=13",
};
const JANE: Author = {
  name: "Jane Doe",
  username: "jane.design",
  verified: true,
  avatarUrl: "https://i.pravatar.cc/150?img=47",
};
const PETER: Author = {
  name: "Peter Nguyễn",
  username: "peter.devops",
  verified: true,
  avatarUrl: "https://i.pravatar.cc/150?img=33",
};
const LINH: Author = {
  name: "Linh Dev",
  username: "linh.dev",
  verified: false,
  avatarUrl: "https://i.pravatar.cc/150?img=44",
};
const TUAN_ANH: Author = {
  name: "Tuấn Anh",
  username: "tuananh.fe",
  verified: false,
  avatarUrl: "https://i.pravatar.cc/150?img=52",
};

export const POSTS: Post[] = [
  // 1. Simple text post - giong Threads/X, khong co gi khac ngoai chu.
  {
    id: "p1",
    kind: "text",
    author: LUCAS,
    timeAgo: "2h",
    content: "Hôm nay mình finally hiểu được Event Loop sau 2 ngày vật lộn.",
    stats: { likes: 236, comments: 28, reposts: 12 },
    following: true,
  },
  // 2. Text + 1 anh - case pho bien nhat.
  {
    id: "p2",
    kind: "image",
    author: MINH,
    timeAgo: "4h",
    content: "Hôm nay hoàn thành dashboard mới.",
    image: {
      url: "https://picsum.photos/seed/careertree-dashboard/900/560",
      alt: "Dashboard screenshot",
    },
    stats: { likes: 312, comments: 45, reposts: 68 },
    following: true,
  },
  // 3. Text + nhieu anh - vi du chia se cac iteration UI.
  {
    id: "p3",
    kind: "gallery",
    author: JANE,
    timeAgo: "6h",
    content: "Đây là các iteration mình đã thử.",
    images: [
      {
        url: "https://picsum.photos/seed/ui-iter-1/500/500",
        alt: "Iteration 1",
      },
      {
        url: "https://picsum.photos/seed/ui-iter-2/500/500",
        alt: "Iteration 2",
      },
      {
        url: "https://picsum.photos/seed/ui-iter-3/500/500",
        alt: "Iteration 3",
      },
      {
        url: "https://picsum.photos/seed/ui-iter-4/500/500",
        alt: "Iteration 4",
      },
    ],
    stats: { likes: 189, comments: 32, reposts: 15 },
    following: false,
  },
  // 4. Chi co anh (whiteboard/mindmap) - khong can viet nhieu.
  {
    id: "p4",
    kind: "image",
    author: TUAN_ANH,
    timeAgo: "7h",
    image: {
      url: "https://picsum.photos/seed/mindmap-whiteboard/900/620",
      alt: "Whiteboard mindmap",
    },
    stats: { likes: 154, comments: 11, reposts: 4 },
    following: false,
  },
  // 5. Video.
  {
    id: "p5",
    kind: "video",
    author: PETER,
    timeAgo: "8h",
    content: "Demo nhanh tính năng Focus Timer vừa ship.",
    video: {
      thumbnailUrl: "https://picsum.photos/seed/focus-timer-demo/900/560",
      duration: "1:24",
    },
    stats: { likes: 142, comments: 21, reposts: 9 },
    following: false,
  },
  // 6. File / document attachment.
  {
    id: "p6",
    kind: "file",
    author: LINH,
    timeAgo: "10h",
    content: "Note tổng hợp buổi review System Design tuần này.",
    file: {
      name: "system-design-review-notes.pdf",
      ext: "PDF",
      size: "2.4 MB",
    },
    stats: { likes: 98, comments: 14, reposts: 6 },
    following: true,
  },
  // 7. Link preview (ngoai app).
  {
    id: "p7",
    kind: "link",
    author: MINH,
    timeAgo: "12h",
    content: "Đọc bài này thấy giải thích Backend Roadmap rất dễ hiểu.",
    link: {
      domain: "minhtran.notion.site",
      title: "Backend Roadmap 2024",
      description:
        "A step-by-step guide to becoming a strong backend engineer in 2024.",
      icon: Boxes,
      accent: "#38bdf8",
    },
    stats: { likes: 267, comments: 19, reposts: 22 },
    following: true,
  },
  // 8. Resource - object rieng, khong phai link thuong, co rating + Save.
  {
    id: "p8",
    kind: "resource",
    author: JANE,
    timeAgo: "1d",
    resource: {
      title: "Clean Architecture.pdf",
      kindLabel: "Ebook · 420 trang",
      rating: 4.8,
      icon: BookOpen,
      accent: "#8b5cf6",
    },
    stats: { likes: 421, comments: 56, reposts: 24 },
    following: false,
  },
  // 9. Project Update - giong GitHub Release, tac gia thich nhat.
  {
    id: "p9",
    kind: "project-update",
    author: LUCAS,
    timeAgo: "1d",
    project: "CareerTree",
    version: "v0.4",
    changes: ["Galaxy View", "AI Mentor", "Feed"],
    icon: FolderGit2,
    accent: "#22223b",
    stats: { likes: 512, comments: 84, reposts: 31 },
    following: true,
  },
  // 10. Achievement.
  {
    id: "p10",
    kind: "achievement",
    author: PETER,
    timeAgo: "2d",
    title: "Reached Top 1%",
    description: "Completed System Design",
    icon: Trophy,
    accent: "#f59e0b",
    stats: { likes: 388, comments: 42, reposts: 18 },
    following: false,
  },
  // 11. Learning Milestone.
  {
    id: "p11",
    kind: "milestone",
    author: TUAN_ANH,
    timeAgo: "2d",
    content:
      "Cột mốc nhỏ nhưng rất đáng nhớ - cảm ơn mọi người đã đồng hành cùng mình suốt 100 ngày qua!",
    title: "100 ngày học liên tục",
    items: [
      { label: "Ngày học", value: "100" },
      { label: "Giờ học", value: "500" },
      { label: "Sách đã đọc", value: "20" },
    ],
    stats: { likes: 302, comments: 27, reposts: 9 },
    following: true,
  },
  // 12. Knowledge Note (TIL) - "linh hon" cua app.
  {
    id: "p12",
    kind: "note",
    author: LINH,
    timeAgo: "3d",
    title: "React.memo không phải lúc nào cũng giúp tăng performance.",
    content:
      "Render rất khác nhau tuỳ vào việc props có thay đổi identity hay không.",
    tag: "TIL",
    stats: { likes: 267, comments: 33, reposts: 14 },
    following: true,
  },
  // 13. Question / Discussion.
  {
    id: "p13",
    kind: "question",
    author: JANE,
    timeAgo: "3d",
    content: "Mọi người thường deploy Next.js lên đâu?",
    stats: { likes: 76, comments: 62, reposts: 3 },
    following: false,
  },
  // 14. Poll.
  {
    id: "p14",
    kind: "poll",
    author: MINH,
    timeAgo: "4d",
    question: "Bạn dùng gì cho project tiếp theo?",
    options: [
      { label: "React", votes: 182 },
      { label: "Vue", votes: 64 },
      { label: "Angular", votes: 21 },
    ],
    stats: { likes: 94, comments: 40, reposts: 5 },
    following: true,
  },
  // 15. Career Update.
  {
    id: "p15",
    kind: "career-update",
    author: PETER,
    timeAgo: "5d",
    company: "VNG",
    role: "Frontend Engineer",
    stats: { likes: 645, comments: 91, reposts: 27 },
    following: false,
  },
  // 16. New Skill.
  {
    id: "p16",
    kind: "skill-update",
    author: LUCAS,
    timeAgo: "5d",
    skill: "TypeScript",
    level: 4,
    maxLevel: 5,
    stats: { likes: 132, comments: 9, reposts: 2 },
    following: true,
  },
  // 17. New Node.
  {
    id: "p17",
    kind: "node-created",
    author: TUAN_ANH,
    timeAgo: "6d",
    nodeName: "Backend Architecture",
    blockName: "Backend",
    stats: { likes: 58, comments: 4, reposts: 1 },
    following: false,
  },
  // 18. Knowledge Block.
  {
    id: "p18",
    kind: "knowledge-block",
    author: MINH,
    timeAgo: "6d",
    block: "Frontend Development",
    progress: 78,
    icon: Code2,
    accent: "#38bdf8",
    stats: { likes: 210, comments: 17, reposts: 8 },
    following: true,
  },
  // 19. Timeline Event.
  {
    id: "p19",
    kind: "timeline-event",
    author: JANE,
    timeAgo: "2 năm trước",
    event: "Bắt đầu học React",
    stats: { likes: 340, comments: 22, reposts: 11 },
    following: false,
  },
  // 20. Code Snippet.
  {
    id: "p20",
    kind: "code-snippet",
    author: LUCAS,
    timeAgo: "7d",
    language: "TypeScript",
    title: "Debounce hook",
    code: `function useDebounce<T>(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n  return debounced;\n}`,
    stats: { likes: 315, comments: 22, reposts: 19 },
    following: true,
  },
  // 21. Idea Share.
  {
    id: "p21",
    kind: "idea",
    author: LINH,
    timeAgo: "7d",
    content:
      "Nếu feed có thể tự gợi ý người nên follow dựa trên skill đang học thì hay đấy nhỉ?",
    stats: { likes: 205, comments: 48, reposts: 6 },
    following: true,
  },
  // 22. Tutorial / Guide.
  {
    id: "p22",
    kind: "tutorial",
    author: MINH,
    timeAgo: "8d",
    title: "Setup CI/CD với GitHub Actions",
    description: "Hướng dẫn từng bước dựng pipeline test + deploy tự động.",
    steps: 7,
    icon: Wrench,
    accent: "#38bdf8",
    stats: { likes: 498, comments: 36, reposts: 41 },
    following: true,
  },
  // 23. Experiment.
  {
    id: "p23",
    kind: "experiment",
    author: PETER,
    timeAgo: "9d",
    title: "So sánh cold start: Lambda vs Cloud Run",
    hypothesis: "Cloud Run sẽ có cold start thấp hơn với cùng cấu hình.",
    result: "Cloud Run nhanh hơn ~38% ở lần gọi đầu tiên.",
    stats: { likes: 193, comments: 14, reposts: 7 },
    following: false,
  },
  // 24. Event / Announcement.
  {
    id: "p24",
    kind: "event",
    author: JANE,
    timeAgo: "10d",
    title: "CareerTree Meetup #3: Frontend Performance",
    when: "Thứ 7, 20/07 · 14:00",
    location: "Online qua Google Meet",
    stats: { likes: 309, comments: 22, reposts: 15 },
    following: false,
  },
];

export const SNAPSHOT = {
  careerScore: 84,
  careerPercentile: "Top 12%",
  skillsMastered: 52,
  totalBlocks: 6,
  projectsCompleted: 18,
  badgesEarned: 7,
};

export const CURRENT_FOCUS = {
  name: "System Design",
  masteryPercent: 66,
  icon: Layers,
  accent: "#38bdf8",
};

export type TrendingSkill = {
  name: string;
  icon: LucideIcon;
  accent: string;
  posts: number;
  trend: number[];
};

export const TRENDING_SKILLS: TrendingSkill[] = [
  {
    name: "System Design",
    icon: Layers,
    accent: "#22d3ee",
    posts: 1200,
    trend: [3, 4, 4, 6, 5, 7, 9, 8, 10, 12],
  },
  {
    name: "Docker",
    icon: Boxes,
    accent: "#38bdf8",
    posts: 987,
    trend: [6, 5, 7, 6, 8, 7, 9, 8, 9, 10],
  },
  {
    name: "React Server Components",
    icon: Code2,
    accent: "#8b5cf6",
    posts: 864,
    trend: [4, 5, 4, 5, 6, 5, 6, 7, 6, 8],
  },
  {
    name: "AWS CDK",
    icon: Cloud,
    accent: "#f59e0b",
    posts: 642,
    trend: [8, 7, 6, 7, 5, 6, 5, 6, 5, 4],
  },
  {
    name: "Vector Database",
    icon: Database,
    accent: "#8b5cf6",
    posts: 512,
    trend: [2, 3, 3, 4, 5, 6, 7, 7, 8, 9],
  },
];

export const WHATS_HAPPENING: {
  name: string;
  action: string;
  target: string;
  time: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    name: "Peter Nguyễn",
    action: "earned the achievement",
    target: "Consistency Master",
    time: "2h ago",
    icon: Trophy,
    accent: "#f59e0b",
  },
  {
    name: "Linh Dev",
    action: "shared a new resource",
    target: "10 VS Code Extensions for Productive Developers",
    time: "3h ago",
    icon: Wrench,
    accent: "#38bdf8",
  },
  {
    name: "Jane Doe",
    action: "completed the challenge",
    target: "30 Days of System Design · Day 18/30",
    time: "5h ago",
    icon: Code2,
    accent: "#8b5cf6",
  },
];

export const PEOPLE_TO_FOLLOW: {
  name: string;
  username: string;
  role: string;
  verified: boolean;
  matchPercent: number;
  tags: string[];
  posts: number;
  followers: number;
  helpfulPercent: number;
}[] = [
  {
    name: "Anh Nguyễn",
    username: "anh.dev",
    role: "Senior Frontend Engineer",
    verified: true,
    matchPercent: 92,
    tags: ["React", "TypeScript", "Next.js"],
    posts: 48,
    followers: 12400,
    helpfulPercent: 97,
  },
  {
    name: "Huy Lê",
    username: "huy.cloud",
    role: "Cloud Architect",
    verified: true,
    matchPercent: 88,
    tags: ["AWS", "Docker", "K8s"],
    posts: 36,
    followers: 8700,
    helpfulPercent: 96,
  },
  {
    name: "Phương Trần",
    username: "phuong.ai",
    role: "ML Engineer",
    verified: true,
    matchPercent: 85,
    tags: ["ML", "Python", "PyTorch"],
    posts: 29,
    followers: 11200,
    helpfulPercent: 94,
  },
  {
    name: "Minh Trần",
    username: "minh.engineer",
    role: "DevOps Engineer",
    verified: true,
    matchPercent: 83,
    tags: ["DevOps", "Terraform", "CI/CD"],
    posts: 41,
    followers: 6100,
    helpfulPercent: 93,
  },
];

export type MySpace = { name: string; icon: LucideIcon; accent: string };

export const MY_SPACES: MySpace[] = [
  { name: "Frontend", icon: Code2, accent: "#10b981" },
  { name: "Backend", icon: Boxes, accent: "#38bdf8" },
  { name: "DevOps", icon: Cloud, accent: "#f59e0b" },
  { name: "AI / ML", icon: Sparkles, accent: "#8b5cf6" },
];
