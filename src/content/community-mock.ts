// MOCK - chua co backend nao cho Community (khong co model Prisma, khong co
// endpoint) - giong huong da chon cho series-mock.ts: dung UI de chot huong
// thiet ke truoc, gui tin nhan/duyet yeu cau chi doi state client, chua luu
// len server. Xem docs/engineering-log.md neu can doi huong sau nay.
//
// Card series o trang "Đi cùng mọi người" (CommunityCard.tsx) dan thang toi
// /community/[slug=series.slug] - MOI series co 1 trang Community rieng.
// community-mock chi bien soan tay 1 vi du chi tiet ("on-certificate"),
// buildCommunityFromSeries() o cuoi file SINH Community (kenh chat + yeu
// cau tham gia tu Series.joinRequests co san) cho 8 slug con lai.
import type { Series, SeriesTask } from "./series-mock";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

// Nhanh kien thuc mot tac gia dang hoc - hien nhu "vien ngoc" nho canh ten
// trong CommunityPostCard.tsx, hover vao thay tien do. "accent" la mau rieng
// cua nhanh (dong bo tinh than voi Series.accent), khong dung chung 1 mau.
export type CommunityKnowledgeBranch = {
  label: string; // vd "AWS Cloud"
  accent: string; // hex
  progressPercent: number;
};

export type CommunityAuthor = {
  name: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
  knowledgeBranches?: CommunityKnowledgeBranch[];
};

export type ChannelMessageReaction = { emoji: string; count: number };

// Xem truoc 1 phan hoi NOI BAT nhat cua bai viet (khong phai toan bo thread) -
// hien duoi footer reactions, kem link "Xem thêm N phản hồi".
export type ChannelMessageTopReply = {
  author: CommunityAuthor;
  authorBadge?: string;
  timeLabel: string;
  content: string;
  moreCount: number;
};

export type ChannelMessage = {
  id: string;
  author: CommunityAuthor;
  authorBadge?: string; // vd "Thành viên tích cực", "Mentor" - hien canh ten
  authorTitle?: string; // vd "Frontend Mentor" - phu de sau badge, cach dau "·"
  timeLabel: string;
  actionLabel?: string; // vd "Hoàn thành Learning Node" - hien sau timeLabel, cach dau "·"
  topicTag?: string; // vd "AWS / IAM / Security" - pill goc phai tren cung hang header
  categoryTag?: string; // vd "🏆 Learning Update" - pill nho phia tren tieu de
  // Co "title" -> hien nhu 1 "bai viet" dien dan (tieu de dam); khong co ->
  // chi hien doan noi dung ngan (vd 1 phan hoi don gian) - xem CommunityPostCard.tsx.
  title?: string;
  content: string;
  bulletPoints?: string[];
  codeBlock?: { language: string; code: string };
  imageUrl?: string;
  attachmentName?: string;
  attachmentMeta?: string; // vd "1.8 MB"
  xp?: { amount: number; label: string }; // khung thuong XP ben canh noi dung
  progressPercent?: number; // thanh progress di kem xp (vd tien do Skill Tree)
  reactions: ChannelMessageReaction[];
  replyCount: number;
  topReply?: ChannelMessageTopReply;
};

export type CommunityChannelGroup = "knowledge" | "tools";

// The dang CARD (khac han pinnedMessage - 1 banner don) - dung cho kenh
// "kho tai nguyen" (vd #resources), noi nhieu bai co the duoc ghim cung luc
// thay vi chi 1 bai duy nhat.
export type CommunityPinnedPost = {
  authorName: string;
  authorBadge?: string; // vd "👑 ADMIN" canh ten
  timeLabel: string;
  title: string;
  attachmentName?: string;
  likes: number;
  comments: number;
};

export type CommunityChannel = {
  slug: string;
  name: string;
  group: CommunityChannelGroup;
  description: string;
  messageCount: number;
  // Anh nen cho hero dau kenh (CommunityChannelHero.tsx) - CHUA co asset that,
  // de trong thi hero tu fallback ve gradient. Dien link vao day khi co anh.
  bannerImageUrl?: string;
  // Banner ghim DUY NHAT, dung chung cho MOI kenh (khong con phan biet kenh
  // chat thuong / kenh tai nguyen o phan nay nua - xem CommunityChannelHero.tsx).
  pinnedMessage?: {
    author: CommunityAuthor;
    timeLabel: string;
    title: string;
    excerpt: string;
  };
  // Rieng vai kenh (vd #resources) co THEM danh sach bai ghim dang CARD,
  // hien duoi pinnedMessage.
  pinnedPosts?: CommunityPinnedPost[];
  messages: ChannelMessage[];
};

// Dung de chon icon/mau hien thi trong khoi "Tài liệu hữu ích" (gop chung
// docsAndLinks + usefulLinks) - xem CommunityRightPanelMember.tsx.
export type CommunityResourceKind = "doc" | "pdf" | "video" | "link";

export type CommunityLinkDoc = {
  title: string;
  meta: string; // vd "PDF · 2.4 MB · Hà Linh"
  kind?: CommunityResourceKind; // mac dinh "pdf" neu khong co (du lieu cu)
};

export type CommunityUsefulLink = {
  title: string;
  domain: string;
  kind?: CommunityResourceKind; // mac dinh "link" neu khong co (du lieu cu)
};

export type CommunityActiveMember = {
  name: string;
  avatarUrl: string;
  statusLabel: string; // vd "Đang online" / "Đang học React" - fallback khi khong co roleBadge/points
  roleBadge?: string; // vd "Mentor" / "Thành viên tích cực" / "Thành viên"
  points?: number; // diem hoat dong - hien "X điểm" thay statusLabel khi co
};

export type CommunityJoinRequestStatus = "pending" | "approved" | "rejected";

export type CommunityJoinRequestDetailed = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  experienceLabel: string;
  reason: string;
  submittedLabel: string;
  status: CommunityJoinRequestStatus;
};

export type CommunityAdminStat = {
  label: string;
  value: string;
  deltaLabel?: string;
};

export type CommunityActivityItem = {
  actorName: string;
  action: string;
  timeLabel: string;
};

export type Community = {
  slug: string;
  name: string;
  memberCount: number;
  isPublic: boolean;
  // true = nguoi dang xem la chu series - hien giao dien Admin (sidebar quan
  // tri + duyet yeu cau tham gia) thay vi giao dien Member (chi xem kenh).
  isOwner: boolean;
  description: string;
  channels: CommunityChannel[];
  docsAndLinks: CommunityLinkDoc[];
  usefulLinks: CommunityUsefulLink[];
  activeMembers: CommunityActiveMember[];
  joinRequests: CommunityJoinRequestDetailed[];
  adminStats: CommunityAdminStat[];
  recentActivity: CommunityActivityItem[];
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
    knowledgeBranches: [
      { label: "AWS Cloud", accent: "#f59e0b", progressPercent: 72 },
      { label: "Security", accent: "#ef4444", progressPercent: 55 },
    ],
  },
  halinh: {
    name: "Hà Linh",
    username: "halinh",
    avatarUrl: avatar("author-halinh"),
    verified: false,
    knowledgeBranches: [
      { label: "Azure", accent: "#0ea5e9", progressPercent: 60 },
      { label: "IELTS", accent: "#10b981", progressPercent: 40 },
    ],
  },
  quocbao: {
    name: "Quốc Bảo",
    username: "quocbao",
    avatarUrl: avatar("author-quocbao"),
    verified: true,
    knowledgeBranches: [
      { label: "AWS Cloud", accent: "#f59e0b", progressPercent: 85 },
      { label: "System Design", accent: "#6366f1", progressPercent: 48 },
    ],
  },
  thutrang: {
    name: "Thu Trang",
    username: "thutrang",
    avatarUrl: avatar("author-thutrang"),
    verified: false,
    knowledgeBranches: [{ label: "IELTS", accent: "#10b981", progressPercent: 68 }],
  },
};

export const COMMUNITIES: Community[] = [
  {
    slug: "on-certificate",
    name: "Ôn Certificate Community",
    memberCount: 3200,
    isPublic: true,
    isOwner: true,
    description: "Trao đổi chung về hành trình ôn thi và chinh phục chứng chỉ.",
    channels: [
      {
        slug: "general",
        name: "general",
        group: "knowledge",
        description: "Trao đổi chung về hành trình ôn thi và chinh phục chứng chỉ.",
        messageCount: 12,
        pinnedMessage: {
          author: AUTHORS.halinh,
          timeLabel: "3 ngày trước",
          title: "📌 Roadmap ôn AWS Solutions Architect 2024 (Updated)",
          excerpt: "Tổng hợp lộ trình, tài liệu và kinh nghiệm từ các anh chị đã đỗ Big Tech...",
        },
        messages: [
          {
            id: "m0",
            author: AUTHORS.minhtri,
            authorBadge: "Mentor",
            authorTitle: "AWS Solutions Architect",
            timeLabel: "1 giờ trước",
            actionLabel: "Hoàn thành Learning Node",
            topicTag: "AWS / IAM / Security",
            categoryTag: "🏆 Learning Update",
            title: "🏆 Hoàn thành Learning Node #12",
            content:
              "Hôm nay mình vừa hoàn thành Learning Node về IAM Policy & Security Best Practices.",
            bulletPoints: [
              "Hiểu rõ cách viết Resource ARN đúng chuẩn",
              "Áp dụng nguyên tắc Least Privilege khi cấp quyền",
              "Xử lý hiệu quả policy cho nhiều bucket S3",
            ],
            attachmentName: "IAM_Security_Cheatsheet.pdf",
            attachmentMeta: "1.8 MB",
            xp: { amount: 80, label: "Đóng góp chất lượng" },
            progressPercent: 63,
            reactions: [
              { emoji: "👍", count: 24 },
              { emoji: "💡", count: 18 },
              { emoji: "🔥", count: 9 },
              { emoji: "🚀", count: 4 },
              { emoji: "👏", count: 6 },
            ],
            replyCount: 12,
            topReply: {
              author: AUTHORS.halinh,
              authorBadge: "Thành viên tích cực",
              timeLabel: "45 phút trước",
              content: "Mình cũng đang học phần này, phần IAM Policy khá hay. Cảm ơn bạn đã chia sẻ!",
              moreCount: 11,
            },
          },
          {
            id: "m1",
            author: AUTHORS.minhtri,
            authorBadge: "Thành viên tích cực",
            timeLabel: "2 giờ trước",
            title: "IAM Policy nên viết Resource ARN kiểu nào?",
            content: "Mọi người nghĩ sao về policy IAM này, mình đang phân vân giữa 2 cách viết:",
            bulletPoints: [
              "Ghi cứng tên bucket vào ARN - dễ đọc nhưng phải sửa lại khi đổi tên.",
              "Dùng biến/tham số cho tên bucket - linh hoạt hơn khi tái sử dụng policy.",
            ],
            codeBlock: {
              language: "json",
              code: '{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::my-bucket/*"\n}',
            },
            reactions: [
              { emoji: "👍", count: 12 },
              { emoji: "❤️", count: 4 },
            ],
            replyCount: 3,
          },
          {
            id: "m2",
            author: AUTHORS.halinh,
            authorBadge: "Admin",
            timeLabel: "10:32 AM",
            content:
              "Theo mình thì hợp lý, nhưng nhớ check kỹ Resource ARN nha. Nếu bucket đổi tên thì phải sửa lại policy.",
            reactions: [],
            replyCount: 0,
          },
          {
            id: "m3",
            author: AUTHORS.quocbao,
            authorBadge: "Mentor",
            timeLabel: "4 giờ trước",
            title: "Mình vừa thi thử AWS SAA, đạt 850 điểm",
            content: "Chia sẻ lại kết quả bài thi thử để mọi người tham khảo, kèm vài lưu ý khi ôn:",
            bulletPoints: [
              "Phần networking (VPC, Route Table) chiếm khá nhiều câu hỏi.",
              "Nên luyện thêm case study về High Availability và Disaster Recovery.",
            ],
            imageUrl: "https://picsum.photos/seed/aws-mock-test/480/240",
            attachmentName: "aws-saa-mock-test-review.pdf",
            reactions: [{ emoji: "👍", count: 8 }],
            replyCount: 2,
          },
        ],
      },
      {
        slug: "aws",
        name: "aws",
        group: "knowledge",
        description: "Chứng chỉ AWS (Solutions Architect, Developer, SysOps...).",
        messageCount: 18,
        messages: [],
      },
      {
        slug: "azure",
        name: "azure",
        group: "knowledge",
        description: "Chứng chỉ Microsoft Azure.",
        messageCount: 9,
        messages: [],
      },
      {
        slug: "ielts-toeic",
        name: "ielts-toeic",
        group: "knowledge",
        description: "Ôn thi IELTS/TOEIC.",
        messageCount: 14,
        messages: [],
      },
      {
        slug: "mock-interview",
        name: "mock-interview",
        group: "knowledge",
        description: "Luyện phỏng vấn thử.",
        messageCount: 6,
        messages: [],
      },
      {
        slug: "resources",
        name: "resources",
        group: "knowledge",
        description: "Chia sẻ tài liệu, nguồn học tập và công cụ hữu ích.",
        messageCount: 9,
        pinnedPosts: [
          {
            authorName: "Hà Linh",
            authorBadge: "👑 ADMIN",
            timeLabel: "3 ngày trước",
            title: "Roadmap ôn AWS Solutions Architect 2024 (Updated)",
            attachmentName: "roadmap-aws-saa-2024.pdf",
            likes: 24,
            comments: 12,
          },
          {
            authorName: "Quốc Bảo",
            timeLabel: "2 tuần trước",
            title: "Bộ câu hỏi phỏng vấn Cloud Engineer theo từng chủ đề",
            attachmentName: "cloud-interview-questions.pdf",
            likes: 18,
            comments: 8,
          },
          {
            authorName: "Admin",
            timeLabel: "1 tháng trước",
            title: "Quy tắc cộng đồng",
            attachmentName: "community-rules.pdf",
            likes: 42,
            comments: 15,
          },
        ],
        messages: [
          {
            id: "res-m1",
            author: AUTHORS.minhtri,
            timeLabel: "10:24 AM",
            content: "Mọi người có tài liệu nào tổng hợp câu hỏi Azure AZ-104 không, mình đang ôn phần networking.",
            reactions: [
              { emoji: "👍", count: 12 },
              { emoji: "❤️", count: 4 },
            ],
            replyCount: 3,
          },
        ],
      },
      {
        slug: "jobs-opportunities",
        name: "jobs-opportunities",
        group: "knowledge",
        description: "Cơ hội việc làm liên quan tới chứng chỉ.",
        messageCount: 3,
        messages: [],
      },
    ],
    docsAndLinks: [
      { title: "Frontend_Cheat_Sheet.pdf", meta: "PDF · 2.4 MB · Hà Linh", kind: "pdf" },
      {
        title: "React_Interview_Questions.pdf",
        meta: "PDF · 1.8 MB · Minh Trí",
        kind: "pdf",
      },
      { title: "System_Design_Guide.pdf", meta: "PDF · 4.2 MB · Quốc Bảo", kind: "pdf" },
      {
        title: "useMemo_vs_useCallback.pdf",
        meta: "PDF · 1.2 MB · Thu Trang",
        kind: "pdf",
      },
    ],
    usefulLinks: [
      { title: "AWS Documentation", domain: "docs.aws.amazon.com", kind: "doc" },
      { title: "Microsoft Learn", domain: "learn.microsoft.com", kind: "doc" },
      {
        title: "AWS re:Invent - Deep Dive VPC",
        domain: "youtube.com · 45 phút",
        kind: "video",
      },
      { title: "IELTS Official Practice", domain: "ielts.org", kind: "link" },
    ],
    activeMembers: [
      {
        name: "Minh Trí",
        avatarUrl: AUTHORS.minhtri.avatarUrl,
        statusLabel: "Đang online",
        roleBadge: "Mentor",
        points: 12000,
      },
      {
        name: "Hà Linh",
        avatarUrl: AUTHORS.halinh.avatarUrl,
        statusLabel: "Đang online",
        roleBadge: "Thành viên tích cực",
        points: 9800,
      },
      {
        name: "Đức Anh",
        avatarUrl: avatar("ducanh"),
        statusLabel: "Đang online",
        roleBadge: "Thành viên",
        points: 8200,
      },
      {
        name: "Thu Trang",
        avatarUrl: AUTHORS.thutrang.avatarUrl,
        statusLabel: "Đang học React",
        roleBadge: "Thành viên",
        points: 7500,
      },
    ],
    joinRequests: [
      {
        id: "jr1",
        name: "Nguyễn Phương Anh",
        avatarUrl: avatar("jr-phuonganh"),
        email: "frontend.anh@gmail.com",
        experienceLabel: "Frontend Developer · 3 năm kinh nghiệm",
        reason:
          "Mình đang muốn ôn thêm về system design và mock interview để chuẩn bị phỏng vấn ở các công ty product.",
        submittedLabel: "2 giờ trước",
        status: "pending",
      },
      {
        id: "jr2",
        name: "Trần Minh Quân",
        avatarUrl: avatar("jr-minhquan"),
        email: "minhquan.dev@gmail.com",
        experienceLabel: "Sinh viên · ĐH Bách Khoa",
        reason: "Em muốn tham gia để học hỏi và kết nối với các anh chị đi trước.",
        submittedLabel: "5 giờ trước",
        status: "pending",
      },
      {
        id: "jr3",
        name: "Lê Thu Trang",
        avatarUrl: avatar("jr-thutrang2"),
        email: "thutrang98@gmail.com",
        experienceLabel: "UI/UX Designer · 2 năm kinh nghiệm",
        reason: "Mình muốn chuyển hướng sang frontend và tìm hiểu lộ trình phù hợp.",
        submittedLabel: "1 ngày trước",
        status: "pending",
      },
    ],
    adminStats: [
      { label: "Thành viên", value: "3.2K", deltaLabel: "+12% tuần này" },
      { label: "Bài viết / tuần", value: "245", deltaLabel: "+8% tuần này" },
      { label: "Thành viên mới", value: "32" },
      { label: "Kênh kiến thức", value: "7" },
    ],
    recentActivity: [
      { actorName: "Hà Linh", action: "đã ghim bài viết trong #react", timeLabel: "2 giờ trước" },
      { actorName: "Quốc Bảo", action: "đã tải lên tài liệu mới", timeLabel: "5 giờ trước" },
      { actorName: "Admin", action: "đã duyệt 5 yêu cầu tham gia", timeLabel: "1 ngày trước" },
      { actorName: "Minh Trí", action: "đã tạo kênh mới #nextjs", timeLabel: "2 ngày trước" },
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
// dung o CommunityCard.tsx (the o trang danh sach "Đi cùng mọi người").
export function estimateDiscussionCount(series: Series): number {
  return Math.round(series.memberCount * 0.35);
}

export function estimateDocumentCount(series: Series): number {
  const resourceTaskCount = series.todayTasks.filter(
    (t) => t.targetKind === "resource",
  ).length;
  return Math.round(series.memberCount * 0.08) + resourceTaskCount;
}

// Sinh Community (kenh chat + yeu cau tham gia) tu du lieu Series co san -
// KHONG bia du lieu Series khong co: joinRequests anh xa THANG tu
// Series.joinRequests (da co san reason/intro/avatarUrl that), documents/
// activeMembers rong thi UI tu an (xem cac component CommunityXxx.tsx).
// Email KHONG co tren Series - dung placeholder ro rang tu username (KHONG
// gia vo la email that).
// Sinh tieu de/noi dung/gach dau dong cho 1 "bai viet" tu SeriesTask - theo
// TEMPLATE chung cho tung targetKind (KHONG bia chi tiet ky thuat cu the cua
// tung series, vi Community chi la MOCK UI-first, xem dau file). Dung de
// bai viet tu dong sinh (buildCommunityFromSeries) co bo cuc "bai viet dien
// dan" giong voi du lieu bien soan tay (COMMUNITIES), thay vi 1 dong noi
// dung tro troi nhu truoc.
function buildGeneratedPostContent(
  task: SeriesTask,
  series: Series,
): { title: string; content: string; bulletPoints: string[] } {
  switch (task.targetKind) {
    case "node":
      return {
        title: `Đã hoàn thành: ${task.label}`,
        content: `Vừa hoàn thành một phần trong lộ trình "${series.title}", ghi lại vài điều rút ra được:`,
        bulletPoints: [
          "Nắm được ý chính của phần này và cách áp dụng vào bài tập thực tế.",
          "Sẽ quay lại ôn thêm phần còn chưa chắc trước khi làm bài tổng kết.",
        ],
      };
    case "post":
      return {
        title: `Ghi chú nhanh về ${series.title}`,
        content: "Chia sẻ một ghi chú trong quá trình học, mong nhận thêm góp ý từ mọi người:",
        bulletPoints: [
          "Tóm tắt lại những gì vừa học để dễ tra cứu sau này.",
          "Đánh dấu lại phần còn thắc mắc để hỏi thêm trong nhóm.",
        ],
      };
    case "question":
      return {
        title: "Đã trả lời một câu hỏi trong nhóm",
        content: `Vừa giải đáp một thắc mắc liên quan tới "${series.title}", chia sẻ lại để mọi người cùng tham khảo:`,
        bulletPoints: [
          "Giải thích theo cách dễ hiểu nhất có thể, kèm ví dụ minh hoạ.",
          "Gắn thêm link tài liệu liên quan cho bạn nào muốn tìm hiểu sâu hơn.",
        ],
      };
    case "vote":
      return {
        title: "Đã bình chọn các bài viết hữu ích",
        content: `Điểm qua vài bài viết mình thấy hữu ích trong tuần khi học "${series.title}":`,
        bulletPoints: [
          "Ưu tiên bài có ví dụ thực hành rõ ràng, dễ áp dụng ngay.",
          "Bình chọn giúp các bài chất lượng được nhiều người thấy hơn.",
        ],
      };
    case "project":
      return {
        title: `Cập nhật tiến độ dự án trong "${series.title}"`,
        content: "Chia sẻ một vài cập nhật sau buổi làm dự án thực hành:",
        bulletPoints: [
          "Đã hoàn thành phần khó nhất, còn lại chủ yếu là polish.",
          "Rất mong nhận review từ mọi người trước khi nộp bài.",
        ],
      };
    case "achievement":
      return {
        title: "Vừa đạt một cột mốc mới",
        content: `Ăn mừng một cột mốc nhỏ trên hành trình "${series.title}"!`,
        bulletPoints: [
          "Cảm ơn mọi người trong nhóm đã hỗ trợ suốt thời gian qua.",
          "Tiếp tục cố gắng cho những cột mốc tiếp theo.",
        ],
      };
    case "progress":
    default:
      return {
        title: `Cập nhật tiến độ học "${series.title}"`,
        content: "Điểm lại một chút tiến độ học tập trong tuần:",
        bulletPoints: [
          "Giữ đều nhịp học mỗi ngày, dù chỉ 20-30 phút.",
          "Ghi chú lại phần khó để hỏi thêm trong nhóm.",
        ],
      };
  }
}

export function buildCommunityFromSeries(series: Series): Community {
  const discussionCount = estimateDiscussionCount(series);
  const resourceTasks = series.todayTasks.filter((t) => t.targetKind === "resource");
  const otherTasks = series.todayTasks.filter((t) => t.targetKind !== "resource");

  // SeriesMember (thanh vien) khong co field "verified" nhu CommunityAuthor -
  // gan mac dinh false, chi mang name/avatarUrl/username that qua.
  //
  // GENERATED_POST_COUNT tam tang cao (thay vi chi lay 3 task dau) de co du
  // bai kiem tra mat do feed (1 viewport chua duoc bao nhieu post) - lap
  // vong qua otherTasks (chi co 4 loai) nen tu nhien co lap lai, chap nhan
  // duoc vi day la du lieu MOCK thuan UI, khong phai hanh vi that.
  const GENERATED_POST_COUNT = 18;
  const generalMessages: ChannelMessage[] = Array.from(
    { length: otherTasks.length === 0 ? 0 : GENERATED_POST_COUNT },
    (_, i) => {
      const task = otherTasks[i % otherTasks.length];
      const member = series.members[i % Math.max(series.members.length, 1)];
      // Vien ngoc = chinh Series ma thanh vien dang tham gia, mau lay tu
      // series.accent, tien do lay tu member.progressPercent THAT - khong
      // bia nhanh kien thuc gia (series nay khong co khai niem nhieu nhanh
      // nho nhu du lieu tay o "on-certificate").
      const author: CommunityAuthor = member
        ? {
            name: member.name,
            username: member.username,
            avatarUrl: member.avatarUrl,
            verified: false,
            knowledgeBranches: [
              { label: series.title, accent: series.accent, progressPercent: member.progressPercent },
            ],
          }
        : series.author;
      const { title, content, bulletPoints } = buildGeneratedPostContent(task, series);
      // Vai tro hien thi: thanh vien hang #1 bang xep hang (SeriesMember.rank -
      // du lieu THAT, khong bia) gan nhan "Mentor" nhu tin hieu la nguoi kinh
      // nghiem nhat nhom, con lai la "Thành viên tích cực".
      const authorBadge = member?.rank === 1 ? "Mentor" : "Thành viên tích cực";
      // Uoc luong like/phan hoi tu progressPercent THAT cua thanh vien (thanh
      // vien tien do cao thi bai viet cung duoc tuong tac nhieu hon) - khong
      // phai so ngau nhien vo can cu.
      const likeCount = member ? Math.max(1, Math.round(member.progressPercent / 8)) : 3;
      const replyCount = member ? Math.max(0, Math.round(member.progressPercent / 30)) : 1;
      return {
        id: `${series.slug}-msg-${i}`,
        author,
        authorBadge,
        timeLabel: `${i + 1} ngày trước`,
        title,
        content,
        bulletPoints,
        reactions: [{ emoji: "👍", count: likeCount }],
        replyCount,
      };
    },
  );

  return {
    slug: series.slug,
    name: series.title,
    memberCount: series.memberCount,
    isPublic: true,
    isOwner: series.isOwner,
    description: series.description,
    channels: [
      {
        slug: "general",
        name: "general",
        group: "knowledge",
        description: series.description,
        messageCount: generalMessages.length,
        pinnedMessage: {
          author: series.author,
          timeLabel: "Ghim bởi người tạo",
          title: `📌 ${series.title}`,
          excerpt: series.description,
        },
        messages: generalMessages,
      },
      ...(resourceTasks.length > 0
        ? [
            {
              slug: "resources",
              name: "resources",
              group: "knowledge" as const,
              description: "Tài liệu học tập",
              messageCount: resourceTasks.length,
              messages: [],
            },
          ]
        : []),
    ],
    docsAndLinks: [],
    usefulLinks: [],
    // roleBadge/points suy tu SeriesMember.rank/progressPercent THAT (rank #1
    // -> "Mentor", top 3 -> "Thành viên tích cực", con lai -> "Thành viên";
    // points = progressPercent*100 - cong thuc co can cu, khong phai so bia).
    activeMembers: series.members.slice(0, 5).map((m) => ({
      name: m.name,
      avatarUrl: m.avatarUrl,
      statusLabel: "Đang hoạt động",
      roleBadge: m.rank === 1 ? "Mentor" : m.rank <= 3 ? "Thành viên tích cực" : "Thành viên",
      points: m.progressPercent * 100,
    })),
    joinRequests: series.joinRequests.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatarUrl,
      // Series khong co field email that - placeholder tu username, KHONG
      // gia vo la email that cua nguoi dung.
      email: `${r.username}@example.com`,
      experienceLabel: r.intro,
      reason: r.reason,
      submittedLabel: formatRelativeTime(r.createdAt),
      status: "pending",
    })),
    adminStats: [
      { label: "Thành viên", value: series.memberCount.toString() },
      { label: "Cuộc thảo luận", value: discussionCount.toString() },
      { label: "Ngày hiện tại", value: `${series.currentDay}/${series.estimatedDurationDays}` },
    ],
    recentActivity: [],
  };
}
