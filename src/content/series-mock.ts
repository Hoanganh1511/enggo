// MOCK - chua co backend nao cho Series/XP/badge/bang xep hang/don xin tham
// gia (khong co model Prisma, khong co endpoint). Giu MOCK co y giong
// PEOPLE_TO_FOLLOW trong people-to-follow-mock.ts (khong gia vo la that) -
// dot nay chi dung UI de chot huong thiet ke truoc, nut xin tham gia/duyet
// don/tick viec chi doi state client, chua luu gi len server.
//
// MO HINH: Series la lo trinh hoc do CHINH NGUOI DUNG tao ra, khong phai
// noi dung do he thong bien soan. Bat ky ai cung co the xin tham gia 1 series
// cua nguoi khac (kem loi trinh bay ly do + gioi thieu ban than), va NGUOI
// TAO series la nguoi duyet don do.
//
// Series KHONG phai 1 content type moi: no chi la lop dieu phoi cac entity DA
// CO (Post/Resource/Question/Project/Achievement/Vote/Progress/Learning Node)
// - the hien qua `SeriesTask.href` tro thang toi route co that trong app.

export type SeriesDifficulty = "beginner" | "intermediate" | "advanced";

// "node" = Learning Node trong Skill Tree, KHONG phai 1 Post["kind"] - day la
// ly do tap nay khong tai su dung ContentType cua post-kind-meta.ts.
export type SeriesTaskTargetKind =
  | "post"
  | "resource"
  | "question"
  | "project"
  | "achievement"
  | "vote"
  | "progress"
  | "node";

export type SeriesTask = {
  id: string;
  label: string;
  targetKind: SeriesTaskTargetKind;
  targetCount: number;
  href: string;
  done: boolean;
};

export type SeriesReward = {
  xp: number;
  badgeName: string;
  badgeAccent: string;
};

export type SeriesAuthor = {
  name: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
};

// Trang thai cua NGUOI DUNG HIEN TAI doi voi series: chua xin / da gui don
// dang cho duyet / da duoc nhan vao. Khong dung 1 boolean "joined" nhu ban
// truoc vi gio co buoc duyet o giua.
export type SeriesJoinStatus = "none" | "pending" | "approved";

export type SeriesMember = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  progressPercent: number;
  rank: number;
};

// Don xin tham gia - CHI hien voi nguoi tao series (isOwner).
export type SeriesJoinRequest = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  // 2 phan nguoi xin phai viet trong modal truoc khi gui don.
  reason: string;
  intro: string;
  createdAt: string;
};

export type Series = {
  slug: string;
  title: string;
  description: string;
  type: string;
  difficulty: SeriesDifficulty;
  coverImageUrl?: string;
  accent: string;
  estimatedDurationDays: number;
  currentDay: number;
  progressPercent: number;
  author: SeriesAuthor;
  // True = series do chinh minh tao ra -> thay nut "Xin tham gia" bang khu
  // vuc duyet don o trang chi tiet.
  isOwner: boolean;
  joinStatus: SeriesJoinStatus;
  memberCount: number;
  reward: SeriesReward;
  todayTasks: SeriesTask[];
  members: SeriesMember[];
  joinRequests: SeriesJoinRequest[];
};

export type CommunityGoalContribution = {
  kind: "resource" | "question" | "project" | "note";
  label: string;
  count: number;
  accent: string;
};

// Muc tieu cong dong KHAC series: khong co chu so huu, khong can duyet ai -
// ai dong gop cung duoc tinh vao tien do chung.
export type CommunityGoal = {
  slug: string;
  title: string;
  description: string;
  progressPercent: number;
  goalLabel: string;
  contributorCount: number;
  contributions: CommunityGoalContribution[];
};

export type RecommendedSeries = {
  series: Series;
  reasonLine: string;
};

function avatar(seed: string) {
  return `https://i.pravatar.cc/80?u=${seed}`;
}

function cover(seed: string) {
  return `https://picsum.photos/seed/${seed}/1280/670`;
}

const AUTHORS: Record<string, SeriesAuthor> = {
  minhtri: {
    name: "Minh Trí",
    username: "minhtri",
    avatarUrl: avatar("author-minhtri"),
    verified: true,
  },
  halinh: {
    name: "Hà Linh",
    username: "halinh",
    avatarUrl: avatar("author-halinh"),
    verified: false,
  },
  quocbao: {
    name: "Quốc Bảo",
    username: "quocbao",
    avatarUrl: avatar("author-quocbao"),
    verified: true,
  },
  thutrang: {
    name: "Thu Trang",
    username: "thutrang",
    avatarUrl: avatar("author-thutrang"),
    verified: false,
  },
  ducanh: {
    name: "Đức Anh",
    username: "ducanh",
    avatarUrl: avatar("author-ducanh"),
    verified: false,
  },
};

// Bo viec dung chung - phan lon series deu xoay quanh cung 1 nhom hanh vi
// (doc/luu tai nguyen, hoc node, viet ghi chu, tra loi cau hoi, vote) nen
// khai bao 1 lan roi chon lai theo tung series thay vi chep tay 8 lan.
function buildTasks(
  prefix: string,
  doneIds: string[] = [],
): SeriesTask[] {
  const base: Omit<SeriesTask, "id" | "done">[] = [
    {
      label: "Đọc 1 tài nguyên",
      targetKind: "resource",
      targetCount: 1,
      href: "/home?type=resource",
    },
    {
      label: "Lưu 2 tài nguyên",
      targetKind: "resource",
      targetCount: 2,
      href: "/home?type=resource",
    },
    {
      label: "Hoàn thành 1 Learning Node",
      targetKind: "node",
      targetCount: 1,
      href: "/skill-tree",
    },
    {
      label: "Đăng 1 ghi chú",
      targetKind: "post",
      targetCount: 1,
      href: "/home?type=post",
    },
    {
      label: "Trả lời 1 câu hỏi",
      targetKind: "question",
      targetCount: 1,
      href: "/home?type=question",
    },
    {
      label: "Bình chọn 3 bài hữu ích",
      targetKind: "vote",
      targetCount: 3,
      href: "/home?type=vote",
    },
  ];
  return base.map((task, index) => {
    const id = `${prefix}-t${index + 1}`;
    return { ...task, id, done: doneIds.includes(id) };
  });
}

function buildMembers(prefix: string, progress: number[]): SeriesMember[] {
  const people = [
    ["Minh Trí", "minhtri"],
    ["Hà Linh", "halinh"],
    ["Quốc Bảo", "quocbao"],
    ["Thu Trang", "thutrang"],
    ["Đức Anh", "ducanh"],
  ];
  return progress.map((progressPercent, index) => {
    const [name, username] = people[index % people.length];
    return {
      id: `${prefix}-m${index + 1}`,
      name,
      username,
      avatarUrl: avatar(`${prefix}-${username}`),
      progressPercent,
      rank: index + 1,
    };
  });
}

export const SERIES: Series[] = [
  {
    slug: "30-days-system-design",
    title: "30 ngày System Design",
    description:
      "Học hệ phân tán từ nền tảng tới kiến trúc quy mô lớn, mỗi ngày một khái niệm cốt lõi.",
    type: "Backend Roadmap",
    difficulty: "intermediate",
    coverImageUrl: cover("series-system-design"),
    accent: "#0ea5e9",
    estimatedDurationDays: 30,
    currentDay: 9,
    progressPercent: 30,
    author: AUTHORS.minhtri,
    isOwner: false,
    joinStatus: "approved",
    memberCount: 2148,
    reward: { xp: 500, badgeName: "System Design", badgeAccent: "#0ea5e9" },
    todayTasks: buildTasks("sd", ["sd-t1"]),
    members: buildMembers("sd", [92, 81, 74, 66, 58]),
    joinRequests: [],
  },
  {
    slug: "frontend-interview-sprint",
    title: "Frontend Interview Sprint",
    description:
      "Ôn tập có hệ thống cho vòng phỏng vấn frontend: JavaScript, React, hiệu năng và system design phía client.",
    type: "Interview Sprint",
    difficulty: "intermediate",
    coverImageUrl: cover("series-frontend-interview"),
    accent: "#8b5cf6",
    estimatedDurationDays: 14,
    currentDay: 3,
    progressPercent: 21,
    author: AUTHORS.halinh,
    isOwner: false,
    joinStatus: "pending",
    memberCount: 1362,
    reward: { xp: 320, badgeName: "Interview Ready", badgeAccent: "#8b5cf6" },
    todayTasks: buildTasks("fe"),
    members: buildMembers("fe", [88, 77, 71, 63, 55]),
    joinRequests: [],
  },
  {
    slug: "30-days-ai",
    title: "30 ngày AI",
    description:
      "Từ prompt engineering tới RAG và AI agents — mỗi ngày một thí nghiệm nhỏ có thể chạy được.",
    type: "AI Track",
    difficulty: "advanced",
    coverImageUrl: cover("series-30-days-ai"),
    accent: "#ec4899",
    estimatedDurationDays: 30,
    currentDay: 17,
    progressPercent: 57,
    // Series do CHINH MINH tao - trang chi tiet se hien khu duyet don thay vi
    // nut xin tham gia (xem SeriesDetailContainer.tsx).
    author: AUTHORS.ducanh,
    isOwner: true,
    joinStatus: "approved",
    memberCount: 3021,
    reward: { xp: 640, badgeName: "AI Builder", badgeAccent: "#ec4899" },
    todayTasks: buildTasks("ai", ["ai-t1", "ai-t3"]),
    members: buildMembers("ai", [96, 90, 84, 79, 70]),
    joinRequests: [
      {
        id: "ai-r1",
        name: "Phương Thảo",
        username: "phuongthao",
        avatarUrl: avatar("req-phuongthao"),
        reason:
          "Mình muốn theo series này để có kỷ luật học đều mỗi ngày thay vì đọc lan man. Mục tiêu cuối là tự xây được một RAG chatbot cho tài liệu nội bộ của công ty.",
        intro:
          "Mình là backend dev 3 năm kinh nghiệm (Node.js, Postgres), mới chuyển sang mảng AI được 2 tháng.",
        createdAt: "2026-07-30T09:15:00.000Z",
      },
      {
        id: "ai-r2",
        name: "Gia Huy",
        username: "giahuy",
        avatarUrl: avatar("req-giahuy"),
        reason:
          "Mình đã tự học prompt engineering nhưng thiếu phần agent và đánh giá chất lượng đầu ra. Hy vọng được học cùng nhóm để có người review.",
        intro:
          "Sinh viên năm cuối ngành KHMT, đang làm đồ án tốt nghiệp về hệ thống hỏi đáp tiếng Việt.",
        createdAt: "2026-07-31T14:40:00.000Z",
      },
      {
        id: "ai-r3",
        name: "Khánh Vy",
        username: "khanhvy",
        avatarUrl: avatar("req-khanhvy"),
        reason:
          "Mình cần lộ trình rõ ràng để không bỏ dở giữa chừng như mấy lần trước. Cam kết hoàn thành đủ việc mỗi ngày và chia sẻ lại ghi chú.",
        intro:
          "Product designer đang muốn hiểu sâu hơn về AI để làm việc hiệu quả hơn với team kỹ thuật.",
        createdAt: "2026-08-01T07:05:00.000Z",
      },
    ],
  },
  {
    slug: "docker-fundamentals",
    title: "Docker Fundamentals",
    description:
      "Nắm chắc image, container, volume và multi-stage build qua các bài thực hành ngắn.",
    type: "Fundamentals",
    difficulty: "beginner",
    coverImageUrl: cover("series-docker"),
    accent: "#38bdf8",
    estimatedDurationDays: 7,
    currentDay: 2,
    progressPercent: 28,
    author: AUTHORS.quocbao,
    isOwner: false,
    joinStatus: "none",
    memberCount: 1874,
    reward: { xp: 180, badgeName: "Container Basics", badgeAccent: "#38bdf8" },
    todayTasks: buildTasks("dk"),
    members: buildMembers("dk", [85, 74, 68, 60, 52]),
    joinRequests: [],
  },
  {
    slug: "build-your-portfolio",
    title: "Xây dựng Portfolio",
    description:
      "Biến các dự án đang dang dở thành một portfolio hoàn chỉnh, có case study và số liệu rõ ràng.",
    type: "Career",
    difficulty: "beginner",
    coverImageUrl: cover("series-portfolio"),
    accent: "#10b981",
    estimatedDurationDays: 21,
    currentDay: 6,
    progressPercent: 29,
    author: AUTHORS.thutrang,
    isOwner: false,
    joinStatus: "none",
    memberCount: 946,
    reward: { xp: 400, badgeName: "Portfolio Ready", badgeAccent: "#10b981" },
    todayTasks: buildTasks("pf"),
    members: buildMembers("pf", [80, 72, 65, 58, 50]),
    joinRequests: [],
  },
  {
    slug: "product-design-challenge",
    title: "Product Design Challenge",
    description:
      "Thiết kế một sản phẩm hoàn chỉnh từ nghiên cứu người dùng tới design system và bản demo.",
    type: "Design",
    difficulty: "intermediate",
    coverImageUrl: cover("series-product-design"),
    accent: "#f59e0b",
    estimatedDurationDays: 28,
    currentDay: 11,
    progressPercent: 39,
    author: AUTHORS.halinh,
    isOwner: false,
    joinStatus: "none",
    memberCount: 712,
    reward: { xp: 460, badgeName: "Product Thinker", badgeAccent: "#f59e0b" },
    todayTasks: buildTasks("pd"),
    members: buildMembers("pd", [91, 83, 76, 69, 61]),
    joinRequests: [],
  },
  {
    slug: "become-a-team-lead",
    title: "Trở thành Team Lead",
    description:
      "Kỹ năng dẫn dắt: review code có tính xây dựng, phân rã công việc, giao tiếp và mentoring.",
    type: "Leadership",
    difficulty: "advanced",
    coverImageUrl: cover("series-team-lead"),
    accent: "#f43f5e",
    estimatedDurationDays: 45,
    currentDay: 21,
    progressPercent: 47,
    author: AUTHORS.minhtri,
    isOwner: false,
    joinStatus: "none",
    memberCount: 528,
    reward: { xp: 780, badgeName: "Tech Lead", badgeAccent: "#f43f5e" },
    todayTasks: buildTasks("tl"),
    members: buildMembers("tl", [94, 86, 78, 71, 64]),
    joinRequests: [],
  },
  {
    slug: "backend-roadmap",
    title: "Backend Roadmap",
    description:
      "Lộ trình backend đầy đủ: API design, database, caching, message queue và observability.",
    type: "Backend Roadmap",
    difficulty: "intermediate",
    coverImageUrl: cover("series-backend-roadmap"),
    accent: "#6366f1",
    estimatedDurationDays: 60,
    currentDay: 4,
    progressPercent: 7,
    author: AUTHORS.quocbao,
    isOwner: false,
    joinStatus: "none",
    memberCount: 2603,
    reward: { xp: 900, badgeName: "Backend Engineer", badgeAccent: "#6366f1" },
    todayTasks: buildTasks("br"),
    members: buildMembers("br", [89, 82, 75, 67, 59]),
    joinRequests: [],
  },
];

function seriesBySlug(slug: string): Series {
  const series = SERIES.find((s) => s.slug === slug);
  if (!series) throw new Error(`Series mock khong ton tai: ${slug}`);
  return series;
}

export const RECOMMENDED_SERIES: RecommendedSeries[] = [
  {
    series: seriesBySlug("docker-fundamentals"),
    reasonLine: "Vì bạn vừa học: Docker, CI/CD, Kubernetes",
  },
  {
    series: seriesBySlug("backend-roadmap"),
    reasonLine: "Vì bạn vừa lưu: Distributed Systems, Caching",
  },
  {
    series: seriesBySlug("build-your-portfolio"),
    reasonLine: "Vì bạn có 3 dự án chưa hoàn thiện phần mô tả",
  },
];

export const COMMUNITY_GOALS: CommunityGoal[] = [
  {
    slug: "redis-knowledge-hub",
    title: "Xây kho kiến thức Redis lớn nhất",
    description:
      "Cùng đóng góp tài nguyên, câu hỏi và ghi chú để tạo nguồn tham khảo Redis đầy đủ nhất cho cộng đồng.",
    progressPercent: 87,
    goalLabel: "500 đóng góp",
    contributorCount: 214,
    contributions: [
      { kind: "resource", label: "Tài nguyên", count: 186, accent: "#8b5cf6" },
      { kind: "question", label: "Câu hỏi", count: 132, accent: "#a855f7" },
      { kind: "project", label: "Dự án", count: 41, accent: "#6366f1" },
      { kind: "note", label: "Ghi chú", count: 76, accent: "#eab308" },
    ],
  },
  {
    slug: "vietnamese-frontend-glossary",
    title: "Từ điển thuật ngữ Frontend tiếng Việt",
    description:
      "Chuẩn hoá cách dịch và giải thích các thuật ngữ frontend để người mới dễ tiếp cận hơn.",
    progressPercent: 46,
    goalLabel: "300 mục từ",
    contributorCount: 97,
    contributions: [
      { kind: "note", label: "Ghi chú", count: 94, accent: "#eab308" },
      { kind: "resource", label: "Tài nguyên", count: 28, accent: "#8b5cf6" },
      { kind: "question", label: "Câu hỏi", count: 16, accent: "#a855f7" },
    ],
  },
];
