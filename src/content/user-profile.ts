// Du lieu profile - MOCK, chua noi backend. Shape bam theo thiet ke schema
// that trong career-tree-api/docs/user-schema-design.md (bang User +
// UserProfile) de khi noi API that chi phai doi nguon du lieu, khong phai
// sua lai component.
//
// Backend hien tai (model User trong prisma/schema.prisma) MOI CHI CO
// id/googleId/email/name/yearsOfExperience - chua co username/bio/cover/
// follower count. Do la Phase 1 trong lo trinh cua tai lieu tren.

export type ProfileVisibility = "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE";

export type CareerSnapshot = {
  careerScore: number;
  percentile: string;
  skillsMastered: number;
  totalBlocks: number;
  streakDays: number;
  currentFocus: { name: string; masteryPercent: number; accent: string } | null;
};

// Huy hieu thanh tich - mau lay tu bang accent cua Knowledge Block de badge
// tren profile cung he mau voi card o Skill Tree.
export type ProfileBadge = {
  id: string;
  label: string;
  color: string;
};

export type ProfileLink = {
  label: string;
  url: string;
  kind: "website" | "github";
};

// Nguoi dung rut gon - chi du de ve avatar trong hang "Dang theo doi"/
// "Nguoi theo doi", khong keo ca profile day du.
export type MiniUser = {
  username: string;
  displayName: string;
  avatarUrl: string;
};

// "Bo suu tap" - nhom tai lieu/lo trinh nguoi dung tu gom lai.
export type ProfileCollection = {
  id: string;
  title: string;
  itemCount: number;
  thumbnailUrl: string;
};

export type UserProfileData = {
  // --- Nhom "User" (hot path, doc o moi post) ---
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: string; // ISO - "join date"

  // ID cong khai dang so, HIEN THI duoc - KHAC voi `id` (UUID noi bo, khong
  // bao gio lo ra UI/URL, xem muc 4.1 trong docs/user-schema-design.md).
  publicUid: string;
  // Cap do rut ra tu careerScore, hien canh ten (LV6...).
  level: number;
  membershipLabel: string | null;

  // --- Nhom "UserProfile" (public profile mo rong) ---
  coverImageUrl: string | null;
  bio: string | null;
  bioLong: string[];
  location: string | null;
  websiteUrl: string | null;
  pronouns: string | null;
  role: string | null;
  yearsOfExperience: number | null;
  skills: string[];
  links: ProfileLink[];
  followerCount: number;
  followingCount: number;
  postCount: number;

  // --- Cac khoi phu o cot phai ---
  badges: ProfileBadge[];
  badgeCount: number;
  followingPreview: MiniUser[];
  followerPreview: MiniUser[];
  collections: ProfileCollection[];

  // --- Quan he giua nguoi xem va profile nay (server tinh, khong luu DB) ---
  isSelf: boolean;
  isFollowing: boolean;

  // --- Rieng cua career-tree, khong co trong schema social chuan ---
  career: CareerSnapshot;
};

// Avatar cho cac hang "dang theo doi"/"nguoi theo doi" - sinh tu pravatar de
// khong phai liet ke tay hang chuc nguoi trong file mock.
function miniUsers(seeds: number[]): MiniUser[] {
  return seeds.map((n) => ({
    username: `user${n}`,
    displayName: `Người dùng ${n}`,
    avatarUrl: `https://i.pravatar.cc/150?img=${n}`,
  }));
}

const CURRENT_USER: UserProfileData = {
  id: "u-tuananh",
  username: "tuananh.fe",
  displayName: "Tuấn Anh",
  avatarUrl: "https://i.pravatar.cc/150?img=52",
  isVerified: false,
  createdAt: "2024-03-12T00:00:00.000Z",
  publicUid: "123456789",
  level: 6,
  membershipLabel: "Thành viên năm",
  coverImageUrl: "https://picsum.photos/seed/cover-tuananh/1600/400",
  bio: "Fullstack dev, đang đi sâu vào system design và distributed systems. Ghi lại toàn bộ quá trình học trên Career Tree.",
  bioLong: [
    "Fullstack dev.",
    "Đam mê hệ thống phân tán, hiệu năng và những thứ “đằng sau hậu trường”.",
    "Viết để ghi nhớ – chia sẻ để cùng tiến bộ.",
  ],
  location: "Hà Nội, Việt Nam",
  websiteUrl: "https://tuananh.dev",
  pronouns: "anh ấy",
  role: "Software Engineer",
  yearsOfExperience: 3,
  skills: ["TypeScript", "React", "Next.js", "NestJS", "PostgreSQL"],
  links: [
    { label: "tuananht.dev", url: "https://tuananh.dev", kind: "website" },
    {
      label: "github.com/tuananh-dev",
      url: "https://github.com/tuananh-dev",
      kind: "github",
    },
  ],
  followerCount: 1284,
  followingCount: 342,
  postCount: 87,
  badgeCount: 12,
  badges: [
    { id: "b1", label: "Streak 30 ngày", color: "#38bdf8" },
    { id: "b2", label: "100 ghi chú", color: "#f59e0b" },
    { id: "b3", label: "Kiến trúc sư", color: "#8b5cf6" },
    { id: "b4", label: "Đọc 10 tài liệu", color: "#22d3ee" },
    { id: "b5", label: "Chia sẻ đầu tiên", color: "#f43f5e" },
    { id: "b6", label: "Top 12%", color: "#10b981" },
  ],
  followingPreview: miniUsers([31, 32, 33, 34]),
  followerPreview: miniUsers([41, 42, 43, 44]),
  collections: [
    {
      id: "c1",
      title: "System Design Deep Dive",
      itemCount: 12,
      thumbnailUrl: "https://picsum.photos/seed/col-sysdesign/240/140",
    },
    {
      id: "c2",
      title: "Backend Best Practices",
      itemCount: 23,
      thumbnailUrl: "https://picsum.photos/seed/col-backend/240/140",
    },
    {
      id: "c3",
      title: "Dev Logs",
      itemCount: 35,
      thumbnailUrl: "https://picsum.photos/seed/col-devlog/240/140",
    },
  ],
  isSelf: true,
  isFollowing: false,
  career: {
    careerScore: 84,
    percentile: "Top 12%",
    skillsMastered: 52,
    totalBlocks: 6,
    streakDays: 23,
    currentFocus: {
      name: "System Design",
      masteryPercent: 66,
      accent: "#38bdf8",
    },
  },
};

// Cac khoi phu (huy hieu/bo suu tap/uid/level) chi khai bao day du cho
// CURRENT_USER; cac tac gia khac dung gia tri suy ra tu chinh du lieu co san
// de file mock khong phinh ra vi lap lai.
type OtherSeed = Omit<
  UserProfileData,
  | "publicUid"
  | "level"
  | "membershipLabel"
  | "bioLong"
  | "links"
  | "badges"
  | "badgeCount"
  | "followingPreview"
  | "followerPreview"
  | "collections"
>;

const BADGE_PALETTE = ["#38bdf8", "#f59e0b", "#8b5cf6", "#22d3ee", "#f43f5e", "#10b981"];

function withSocialDefaults(seed: OtherSeed): UserProfileData {
  const badgeCount = Math.max(1, Math.round(seed.career.skillsMastered / 6));
  return {
    ...seed,
    publicUid: String(100000000 + seed.username.length * 7654321),
    level: Math.max(1, Math.round(seed.career.careerScore / 14)),
    membershipLabel: seed.isVerified ? "Thành viên năm" : null,
    bioLong: seed.bio ? [seed.bio] : [],
    links: seed.websiteUrl
      ? [
          {
            label: seed.websiteUrl.replace(/^https?:\/\//, ""),
            url: seed.websiteUrl,
            kind: "website" as const,
          },
        ]
      : [],
    badgeCount,
    badges: BADGE_PALETTE.slice(0, Math.min(6, badgeCount)).map((color, i) => ({
      id: `${seed.id}-b${i}`,
      label: `Huy hiệu ${i + 1}`,
      color,
    })),
    followingPreview: miniUsers([11, 12, 13, 14]),
    followerPreview: miniUsers([21, 22, 23, 24]),
    collections: [],
  };
}

// Cac tac gia xuat hien trong feed mock (xem home-feed-mock.ts) - can co
// profile tuong ung de bam vao ten/avatar trong PostCard dieu huong duoc.
const OTHER_SEEDS: OtherSeed[] = [
  {
    id: "u-lucas",
    username: "lucas.dev",
    displayName: "Lucas Trần",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    isVerified: true,
    createdAt: "2023-01-08T00:00:00.000Z",
    coverImageUrl: "https://picsum.photos/seed/cover-lucas/1200/300",
    bio: "Backend engineer. Viết về Node.js, event loop và những thứ chạy ngầm mà ai cũng tưởng mình hiểu.",
    location: "TP. Hồ Chí Minh",
    websiteUrl: "https://lucas.dev",
    pronouns: null,
    role: "Senior Backend Engineer",
    yearsOfExperience: 6,
    skills: ["Node.js", "NestJS", "Redis", "Kafka"],
    followerCount: 8420,
    followingCount: 189,
    postCount: 214,
    isSelf: false,
    isFollowing: true,
    career: {
      careerScore: 91,
      percentile: "Top 5%",
      skillsMastered: 78,
      totalBlocks: 8,
      streakDays: 64,
      currentFocus: {
        name: "Distributed Systems",
        masteryPercent: 82,
        accent: "#8b5cf6",
      },
    },
  },
  {
    id: "u-minh",
    username: "minh.engineer",
    displayName: "Minh Trần",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    isVerified: true,
    createdAt: "2023-06-20T00:00:00.000Z",
    coverImageUrl: "https://picsum.photos/seed/cover-minh/1200/300",
    bio: "Xây dashboard, tối ưu frontend performance. Tin vào việc đo trước khi tối ưu.",
    location: "Đà Nẵng",
    websiteUrl: null,
    pronouns: null,
    role: "Frontend Engineer",
    yearsOfExperience: 4,
    skills: ["React", "TypeScript", "Tailwind"],
    followerCount: 3150,
    followingCount: 421,
    postCount: 96,
    isSelf: false,
    isFollowing: true,
    career: {
      careerScore: 79,
      percentile: "Top 20%",
      skillsMastered: 41,
      totalBlocks: 5,
      streakDays: 12,
      currentFocus: {
        name: "Web Performance",
        masteryPercent: 58,
        accent: "#22c55e",
      },
    },
  },
  {
    id: "u-jane",
    username: "jane.design",
    displayName: "Jane Doe",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    isVerified: true,
    createdAt: "2022-11-02T00:00:00.000Z",
    coverImageUrl: "https://picsum.photos/seed/cover-jane/1200/300",
    bio: "Product designer làm việc nhiều với engineer. Quan tâm design system và accessibility.",
    location: "Singapore",
    websiteUrl: "https://jane.design",
    pronouns: "cô ấy",
    role: "Product Designer",
    yearsOfExperience: 7,
    skills: ["Figma", "Design System", "A11y"],
    followerCount: 12800,
    followingCount: 233,
    postCount: 341,
    isSelf: false,
    isFollowing: false,
    career: {
      careerScore: 88,
      percentile: "Top 8%",
      skillsMastered: 63,
      totalBlocks: 7,
      streakDays: 31,
      currentFocus: {
        name: "Design Tokens",
        masteryPercent: 74,
        accent: "#f43f5e",
      },
    },
  },
  {
    id: "u-peter",
    username: "peter.devops",
    displayName: "Peter Nguyễn",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    isVerified: true,
    createdAt: "2023-03-15T00:00:00.000Z",
    coverImageUrl: "https://picsum.photos/seed/cover-peter/1200/300",
    bio: "DevOps. Nếu nó chạy trên máy tôi thì nó sẽ chạy trong container của bạn.",
    location: "Hà Nội",
    websiteUrl: null,
    pronouns: null,
    role: "DevOps Engineer",
    yearsOfExperience: 5,
    skills: ["Docker", "Kubernetes", "AWS", "Terraform"],
    followerCount: 5640,
    followingCount: 98,
    postCount: 152,
    isSelf: false,
    isFollowing: false,
    career: {
      careerScore: 85,
      percentile: "Top 11%",
      skillsMastered: 57,
      totalBlocks: 6,
      streakDays: 8,
      currentFocus: {
        name: "Platform Engineering",
        masteryPercent: 45,
        accent: "#f59e0b",
      },
    },
  },
  {
    id: "u-linh",
    username: "linh.dev",
    displayName: "Linh Dev",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
    isVerified: false,
    createdAt: "2024-08-01T00:00:00.000Z",
    coverImageUrl: null,
    bio: "Đang học lập trình, ghi chú lại mỗi ngày.",
    location: null,
    websiteUrl: null,
    pronouns: null,
    role: "Junior Developer",
    yearsOfExperience: 1,
    skills: ["JavaScript", "React"],
    followerCount: 142,
    followingCount: 512,
    postCount: 23,
    isSelf: false,
    isFollowing: false,
    career: {
      careerScore: 41,
      percentile: "Top 60%",
      skillsMastered: 12,
      totalBlocks: 3,
      streakDays: 5,
      currentFocus: {
        name: "JavaScript Cơ bản",
        masteryPercent: 34,
        accent: "#10b981",
      },
    },
  },
];

const OTHERS: UserProfileData[] = OTHER_SEEDS.map(withSocialDefaults);

const BY_USERNAME = new Map<string, UserProfileData>(
  [CURRENT_USER, ...OTHERS].map((p) => [p.username, p]),
);

export function getProfileByUsername(
  username: string,
): UserProfileData | undefined {
  return BY_USERNAME.get(username);
}

export function getCurrentProfile(): UserProfileData {
  return CURRENT_USER;
}

// Giu nguyen export cu (avatar/ten o Sidebar + PostComposer dang dung) de
// khong pha vo cho goi san - chi la "lat cat" gon cua CURRENT_USER.
export const profile = {
  name: CURRENT_USER.displayName,
  planLabel: "Pro",
  username: CURRENT_USER.username,
  avatarUrl: CURRENT_USER.avatarUrl,
};
