export type NodeKind = "BRANCH" | "TOPIC";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type ApiTier = {
  id: string;
  categoryId: string;
  label: string;
  sublabel: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

// Skill Tree: tang phan cap giua Workspace va Tier - 1 Workspace co nhieu
// Category (vd "Frontend", "Backend"), MOI Category co bo Tier rieng cua no.
export type ApiCategory = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIndex: number;
  tiers: ApiTier[];
  createdAt: string;
  updatedAt: string;
};

export type ApiNode = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  goal: string | null;
  title: string;
  kind: NodeKind;
  category: string | null;
  difficulty: Difficulty | null;
  estimatedTime: string | null;
  prerequisites: string[];
  learningOutcomes: string[];
  depth: number;
  orderIndex: number;
  x: number | null;
  y: number | null;
  hiddenFromShare: boolean;
  isCollapsed: boolean;
  content: Record<string, unknown> | null;
  // Skill Tree: null khi node chua duoc dat vao tier nao (vd node cu cua
  // Career Tree canvas) - "tier" chi tra ve khi backend include quan he nay
  // (xem findTreeForWorkspace), khong phai luon co mat.
  tierId: string | null;
  tier?: ApiTier | null;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  practiceCount: number;
  resourceCount: number;
  openIssueCount: number;
  lastActivity: string | null;
  streak: {
    current: number;
    longest: number;
    last7: boolean[];
  };
  isPinned: boolean;
  tags: string[];
};

// Workspace tree list responses omit `content` (Tiptap JSON can be large and is
// never rendered outside the node's own detail modal) — this is the shape held
// in memory for the whole tree at all times. Use `ApiNode` (with `content`)
// only for a single node fetched on demand, e.g. via `getNode`.
export type ApiNodeListItem = Omit<ApiNode, "content">;

export type CardKind = "NOTE" | "PRACTICE";

export type ApiCard = {
  id: string;
  nodeId: string;
  content: Record<string, unknown>;
  kind: CardKind;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiWorkspace = {
  id: string;
  name: string;
  shareToken: string | null;
  shareMode: "PRIVATE" | "STRUCTURE_ONLY" | "FULL";
  createdAt: string;
  updatedAt: string;
};

export type ResourceType = "ARTICLE" | "VIDEO" | "DOC" | "COURSE" | "BOOK";

export type ApiResource = {
  id: string;
  nodeId: string;
  type: ResourceType;
  title: string;
  url: string;
  orderIndex: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiIssue = {
  id: string;
  nodeId: string;
  question: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = "SYSTEM" | "CONNECTION";

export type ApiNotification = {
  id: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CommunityMemberRoleApi = "OWNER" | "ADMIN" | "MENTOR" | "MEMBER";
export type CommunityMemberStatusApi = "PENDING" | "APPROVED" | "REJECTED";

// Dung cho danh sach cong khai (trang "Đi cùng mọi người") - khac ApiCommunity
// (chi tiet 1 community, can auth+viewer role) o cho day la du lieu RUT GON,
// khong co channels/joinRequests/adminStats. Gom CA community rieng tu (chi
// noi dung ben trong moi rieng tu - su ton tai van kham pha duoc, xem
// CommunityService.listPublic).
// Trang thai nguoi xem hien tai voi 1 community: "none" (chua tham gia),
// "pending" (da xin vao cong dong rieng tu, cho quan tri duyet), "member"
// (da la thanh vien APPROVED). Quyet dinh nut o card danh sach - viec vao
// cong dong CHI qua nut, khong click thang card.
export type CommunityViewerStatus = "none" | "pending" | "member";

export type ApiCommunitySummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  isPublic: boolean;
  memberCount: number;
  channelCount: number;
  viewerStatus: CommunityViewerStatus;
  memberAvatars: string[];
  owner: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
    verified: boolean;
  } | null;
};

export type ApiChannel = {
  id: string;
  communityId: string;
  slug: string;
  name: string;
  group: "KNOWLEDGE" | "TOOLS";
  description: string;
  bannerImageUrl: string | null;
  messageCount: number;
  orderIndex: number;
};

export type ApiCommunityMember = {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityMemberRoleApi;
  status: CommunityMemberStatusApi;
  points: number;
  joinReason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    email: string;
  };
};

export type ChannelStatusApi = "PENDING" | "APPROVED" | "REJECTED";

// Kenh do 1 thanh vien thuong de xuat, dang cho quan tri duyet - CHI moderator
// (viewer.role la OWNER/ADMIN) moi nhan duoc field nay trong ApiCommunity.
export type ApiChannelRequest = {
  id: string;
  communityId: string;
  slug: string;
  name: string;
  group: "KNOWLEDGE" | "TOOLS";
  description: string;
  status: ChannelStatusApi;
  createdAt: string;
  requestedBy: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
  } | null;
};

export type ApiCommunity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  isPublic: boolean;
  memberCount: number;
  channels: ApiChannel[];
  viewer: {
    isMember: boolean;
    role: CommunityMemberRoleApi | null;
    status: CommunityMemberStatusApi | null;
  };
  joinRequests: ApiCommunityMember[];
  channelRequests: ApiChannelRequest[];
  adminStats: { label: string; value: string; deltaLabel?: string }[];
};

export type ApiCommunityPostAuthor = {
  username: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export type ApiCommunityPost = {
  id: string;
  channelId: string;
  author: ApiCommunityPostAuthor;
  title: string | null;
  content: string;
  category: "learning" | "question" | "resource" | null;
  isPinned: boolean;
  commentsCount: number;
  createdAt: string;
  reactions: { emoji: string; count: number }[];
  topReply: {
    author: { name: string; avatarUrl: string };
    content: string;
    createdAt: string;
  } | null;
  bulletPoints?: string[];
  codeBlock?: { language: string; code: string };
  imageUrl?: string;
  topicTag?: string;
  actionLabel?: string;
  attachmentName?: string;
  attachmentMeta?: string;
  attachmentSizeBytes?: number;
};

export type ApiComment = {
  id: string;
  postId: string;
  author: ApiCommunityPostAuthor;
  parentId: string | null;
  content: string;
  createdAt: string;
};

// "Tài liệu" - bài dài do nguoi dung soan bang editor lon, thuoc ve tac gia,
// hien trong tab "Tài liệu" cua profile. `content` la Tiptap JSON.
export type ApiDocumentAuthor = {
  username: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export type ApiDocument = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  content: Record<string, unknown>;
  tags: string[];
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  author: ApiDocumentAuthor;
};

// Ban rut gon cho danh sach (khong keo `content`).
export type ApiDocumentSummary = Omit<ApiDocument, "content">;
