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

export type UserProfileData = {
  // --- Nhom "User" (hot path, doc o moi post) ---
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: string; // ISO - "join date"

  // --- Nhom "UserProfile" (public profile mo rong) ---
  coverImageUrl: string | null;
  bio: string | null;
  location: string | null;
  websiteUrl: string | null;
  pronouns: string | null;
  role: string | null;
  yearsOfExperience: number | null;
  skills: string[];
  followerCount: number;
  followingCount: number;
  postCount: number;

  // --- Quan he giua nguoi xem va profile nay (server tinh, khong luu DB) ---
  isSelf: boolean;
  isFollowing: boolean;

  // --- Rieng cua career-tree, khong co trong schema social chuan ---
  career: CareerSnapshot;
};

const CURRENT_USER: UserProfileData = {
  id: "u-tuananh",
  username: "tuananh.fe",
  displayName: "Tuấn Anh",
  avatarUrl: "https://i.pravatar.cc/150?img=52",
  isVerified: false,
  createdAt: "2024-03-12T00:00:00.000Z",
  coverImageUrl: "https://picsum.photos/seed/cover-tuananh/1200/300",
  bio: "Fullstack dev, đang đi sâu vào system design và distributed systems. Ghi lại toàn bộ quá trình học trên Career Tree.",
  location: "Hà Nội, Việt Nam",
  websiteUrl: "https://tuananh.dev",
  pronouns: "anh ấy",
  role: "Software Engineer",
  yearsOfExperience: 3,
  skills: ["TypeScript", "React", "Next.js", "NestJS", "PostgreSQL"],
  followerCount: 1284,
  followingCount: 342,
  postCount: 87,
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

// Cac tac gia xuat hien trong feed mock (xem home-feed-mock.ts) - can co
// profile tuong ung de bam vao ten/avatar trong PostCard dieu huong duoc.
const OTHERS: UserProfileData[] = [
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
