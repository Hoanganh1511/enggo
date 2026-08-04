// MOCK - chua co backend nao cho Community (khong co model Prisma, khong co
// endpoint) - giong huong da chon cho series-mock.ts: dung UI de chot huong
// thiet ke truoc, join/notification/filter chi doi state client, chua luu
// len server. Xem docs/engineering-log.md neu can doi huong sau nay.
//
// Card series o trang "Đi cùng mọi người" (SeriesCard.tsx) dan thang toi
// /community/[slug=series.slug] - MOI series co 1 trang Community rieng thay
// vi trang /series/[slug] cu. Vi community-mock chi tay dung 1 vi du
// ("on-certificate"), buildCommunityFromSeries() o cuoi file SINH Community
// tu du lieu Series co san cho 8 slug con lai (xem getCommunityBySlug).
import type { Series } from "./series-mock";

export type CommunityAuthor = {
  name: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
};

export type CommunityPostCategory =
  | "experience"
  | "qa"
  | "document"
  | "discussion";

export const COMMUNITY_POST_CATEGORY_LABEL: Record<
  CommunityPostCategory,
  string
> = {
  experience: "Kinh nghiệm",
  qa: "Hỏi đáp",
  document: "Tài liệu",
  discussion: "Thảo luận",
};

export type CommunityPost = {
  id: string;
  author: CommunityAuthor;
  createdAt: string;
  category: CommunityPostCategory;
  badgeLabel: string; // nhan hien tren the ("Hướng dẫn"/"Tài liệu"/"Hỏi"...)
  title: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  saves: number;
  repliedAvatarUrls: string[];
  repliedCount: number;
  featured: boolean;
};

export type CommunityChallenge = {
  title: string;
  currentDay: number;
  totalDays: number;
  progressPercent: number;
  participantCount: number;
  joined: boolean;
};

export type CommunityLeaderboardEntry = {
  rank: number;
  name: string;
  avatarUrl: string;
  points: number;
};

export type CommunityCertificate = {
  slug: string;
  name: string;
  accent: string;
  followerCount: number;
};

export type CommunityEvent = {
  title: string;
  dateLabel: string;
  location: string;
  participantAvatarUrls: string[];
  participantCount: number;
};

export type CommunityDocument = {
  title: string;
  updatedLabel: string;
};

export type CommunityGoal = {
  label: string;
  current: number;
  target: number;
  contributorAvatarUrls: string[];
  extraContributorCount: number;
};

export type Community = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  isPublic: boolean;
  memberCount: number;
  postCount: number;
  activeSeriesCount: number;
  tags: string[];
  joined: boolean;
  goal: CommunityGoal;
  challenge: CommunityChallenge;
  leaderboard: CommunityLeaderboardEntry[];
  certificates: CommunityCertificate[];
  // Optional - community SINH tu Series (buildCommunityFromSeries) khong bia
  // ra 1 su kien gia, sidebar tu an het section neu undefined (xem
  // CommunitySidebarLeft.tsx).
  upcomingEvent?: CommunityEvent;
  documents: CommunityDocument[];
  posts: CommunityPost[];
};

function avatar(seed: string) {
  return `https://i.pravatar.cc/80?u=${seed}`;
}

const AUTHORS: Record<string, CommunityAuthor> = {
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
};

const MEMBER_AVATARS = [
  avatar("m1"),
  avatar("m2"),
  avatar("m3"),
  avatar("m4"),
  avatar("m5"),
];

export const COMMUNITIES: Community[] = [
  {
    slug: "on-certificate",
    name: "Ôn Certificate Community",
    tagline: "Học cùng nhau • Thi cùng nhau • Đậu cùng nhau 🎯",
    description:
      "Nơi mọi người cùng chia sẻ tài liệu, kinh nghiệm, và hỗ trợ nhau trong hành trình chinh phục các chứng chỉ giá trị",
    isPublic: true,
    memberCount: 3200,
    postCount: 1200,
    activeSeriesCount: 24,
    tags: ["Certificate", "Ôn thi", "Chia sẻ tài liệu", "Kinh nghiệm thi"],
    joined: true,
    goal: {
      label: "Giúp 100 thành viên đạt chứng chỉ",
      current: 68,
      target: 100,
      contributorAvatarUrls: MEMBER_AVATARS.slice(0, 4),
      extraContributorCount: 42,
    },
    challenge: {
      title: "30 Days AWS Challenge",
      currentDay: 12,
      totalDays: 30,
      progressPercent: 40,
      participantCount: 384,
      joined: false,
    },
    leaderboard: [
      { rank: 1, name: "Minh Trí", avatarUrl: avatar("author-minhtri"), points: 1200 },
      { rank: 2, name: "Hà Linh", avatarUrl: avatar("author-halinh"), points: 980 },
      { rank: 3, name: "Quốc Bảo", avatarUrl: avatar("author-quocbao"), points: 875 },
      { rank: 4, name: "Thu Trang", avatarUrl: avatar("author-thutrang"), points: 690 },
      { rank: 5, name: "Đức Anh", avatarUrl: avatar("author-ducanh"), points: 560 },
    ],
    certificates: [
      { slug: "aws-solutions-architect", name: "AWS Solutions Architect", accent: "#f59e0b", followerCount: 1200 },
      { slug: "google-data-analytics", name: "Google Data Analytics", accent: "#3b82f6", followerCount: 856 },
      { slug: "azure-fundamentals", name: "Microsoft Azure Fundamentals", accent: "#0ea5e9", followerCount: 642 },
      { slug: "ielts-academic", name: "IELTS Academic", accent: "#ef4444", followerCount: 1100 },
      { slug: "toeic-listening-reading", name: "TOEIC Listening & Reading", accent: "#f97316", followerCount: 734 },
    ],
    upcomingEvent: {
      title: "Mock Test AWS SAA",
      dateLabel: "Chủ nhật, 08/06 • 20:00",
      location: "Online trên Discord",
      participantAvatarUrls: MEMBER_AVATARS.slice(0, 4),
      participantCount: 28,
    },
    documents: [
      { title: "AWS SAA Cheat Sheet (PDF)", updatedLabel: "Cập nhật 2 giờ trước" },
      { title: "AZ-104 Practice Questions (200+)", updatedLabel: "Cập nhật 5 giờ trước" },
      { title: "IELTS Writing Task 2 Samples", updatedLabel: "Cập nhật 1 ngày trước" },
      { title: "TOEIC Part 5-6 Tips & Tricks", updatedLabel: "Cập nhật 2 ngày trước" },
    ],
    posts: [
      {
        id: "cp1",
        author: AUTHORS.minhtri,
        createdAt: "2026-07-31T00:00:00Z",
        category: "document",
        badgeLabel: "Hướng dẫn",
        title: "Lộ trình ôn AWS Solutions Architect Associate từ A-Z (2024)",
        description:
          "Chia sẻ lộ trình chi tiết, tài liệu, và kinh nghiệm giúp bạn tiết kiệm 80% thời gian ôn thi.",
        tags: [],
        likes: 421,
        comments: 89,
        saves: 56,
        repliedAvatarUrls: MEMBER_AVATARS.slice(0, 4),
        repliedCount: 56,
        featured: true,
      },
      {
        id: "cp2",
        author: AUTHORS.halinh,
        createdAt: "2026-07-29T00:00:00Z",
        category: "document",
        badgeLabel: "Tài liệu",
        title: "Bộ tài liệu Google Data Analytics đầy đủ (Update 05/2024)",
        description: "Bao gồm notes, practice questions, cheat sheet và case study.",
        tags: [],
        likes: 312,
        comments: 47,
        saves: 34,
        repliedAvatarUrls: MEMBER_AVATARS.slice(0, 4),
        repliedCount: 34,
        featured: true,
      },
      {
        id: "cp3",
        author: AUTHORS.quocbao,
        createdAt: "2026-08-01T00:00:00Z",
        category: "qa",
        badgeLabel: "Hỏi",
        title: "Nên chọn AWS SAA hay Azure AZ-104 trước?",
        description:
          "Mình đang là dev backend, muốn học cloud để nâng cao. Mọi người có kinh nghiệm tư vấn giúp mình nên học chứng chỉ nào trước để dễ apply công việc hơn ạ?",
        tags: ["AWS", "Azure", "Lộ trình học"],
        likes: 12,
        comments: 23,
        saves: 0,
        repliedAvatarUrls: MEMBER_AVATARS.slice(0, 3),
        repliedCount: 12,
        featured: false,
      },
      {
        id: "cp4",
        author: AUTHORS.thutrang,
        createdAt: "2026-08-01T00:00:00Z",
        category: "experience",
        badgeLabel: "Kinh nghiệm",
        title: "Vượt qua AWS SAA sau 45 ngày – chia sẻ hành trình!",
        description:
          "Mình đã đậu AWS SAA với 842 điểm! Cảm ơn cộng đồng rất nhiều vì những tài liệu và động viên.",
        tags: [],
        likes: 88,
        comments: 31,
        saves: 19,
        repliedAvatarUrls: MEMBER_AVATARS.slice(0, 3),
        repliedCount: 31,
        featured: false,
      },
    ],
  },
];

// Uu tien community bien soan tay (COMMUNITIES) - chi 1 vi du "on-certificate"
// dung de chot thiet ke chi tiet. Voi 8 series con lai (khong co ban bien
// soan tay), sinh community TU du lieu Series co san thay vi phai chep tay
// tung truong cho ca 9 slug.
export function getCommunityBySlug(slug: string, allSeries: Series[]): Community | undefined {
  const handcrafted = COMMUNITIES.find((c) => c.slug === slug);
  if (handcrafted) return handcrafted;
  const series = allSeries.find((s) => s.slug === slug);
  return series ? buildCommunityFromSeries(series) : undefined;
}

// Uoc tinh 2 con so Series KHONG co san (so cuoc thao luan / so tai lieu) -
// dung CHUNG giua buildCommunityFromSeries (postCount o trang chi tiet) va
// CommunityCard (dong stat moi tren the o trang danh sach), de 2 noi hien
// khop nhau thay vi moi cho tu bia 1 cong thuc rieng. discussionCount ti le
// theo memberCount (dung ty le xap xi vi du bien soan tay "on-certificate":
// 1200 bai / 3200 thanh vien ~ 0.35). documentCount cong them tin hieu THAT
// (so task targetKind "resource" trong todayTasks) de khong hoan toan bia -
// van la uoc tinh, KHONG phai danh sach tai lieu that (xem "con de ngo" o
// CommunitySidebarRight.tsx: card co the hien so > 0 trong khi khoi "Tai
// lieu moi cap nhat" o trang chi tiet van an vi documents[] de rong).
export function estimateDiscussionCount(series: Series): number {
  return Math.round(series.memberCount * 0.35);
}

export function estimateDocumentCount(series: Series): number {
  const resourceTaskCount = series.todayTasks.filter(
    (t) => t.targetKind === "resource",
  ).length;
  return Math.round(series.memberCount * 0.08) + resourceTaskCount;
}

// Anh xa 1-1 cac truong CO SAN cua Series sang hinh dang Community: thanh
// vien -> leaderboard (sap theo progressPercent), ngay hien tai/tong ngay ->
// vua la "muc tieu thang" vua la "thu thach dang chay" (2 khai niem trung
// nhau khi 1 Community CHI xoay quanh dung 1 series). certificates/documents
// de rong, upcomingEvent de undefined - KHONG bia du lieu ma Series khong co,
// sidebar tu an cac section rong (xem CommunitySidebarLeft/Right.tsx).
export function buildCommunityFromSeries(series: Series): Community {
  const sortedMembers = [...series.members].sort(
    (a, b) => b.progressPercent - a.progressPercent,
  );

  return {
    slug: series.slug,
    name: series.title,
    tagline: series.type,
    description: series.description,
    isPublic: true,
    memberCount: series.memberCount,
    postCount: estimateDiscussionCount(series),
    activeSeriesCount: 1,
    tags: [series.type],
    joined: series.isOwner || series.joinStatus === "approved",
    goal: {
      label: `Hoàn thành ${series.estimatedDurationDays} ngày cùng nhau`,
      current: series.currentDay,
      target: series.estimatedDurationDays,
      contributorAvatarUrls: sortedMembers.slice(0, 4).map((m) => m.avatarUrl),
      extraContributorCount: Math.max(0, series.memberCount - 4),
    },
    challenge: {
      title: series.title,
      currentDay: series.currentDay,
      totalDays: series.estimatedDurationDays,
      progressPercent: series.progressPercent,
      participantCount: series.memberCount,
      joined: series.joinStatus !== "none",
    },
    leaderboard: sortedMembers.slice(0, 5).map((member, i) => ({
      rank: i + 1,
      name: member.name,
      avatarUrl: member.avatarUrl,
      points: Math.round(member.progressPercent * 10),
    })),
    certificates: [],
    upcomingEvent: undefined,
    documents: [],
    posts: [
      {
        id: `${series.slug}-intro`,
        author: series.author,
        createdAt: new Date().toISOString(),
        category: "discussion",
        badgeLabel: series.type,
        title: series.title,
        description: series.description,
        tags: [],
        likes: Math.round(series.memberCount * 0.1),
        comments: Math.round(series.memberCount * 0.03),
        saves: Math.round(series.memberCount * 0.02),
        repliedAvatarUrls: sortedMembers.slice(0, 4).map((m) => m.avatarUrl),
        repliedCount: series.memberCount,
        featured: true,
      },
    ],
  };
}
