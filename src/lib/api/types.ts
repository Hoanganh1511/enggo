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

// Workspace - vung kien thuc top-level nguoi dung tu dat ten (vd "Học tập",
// "Film"), hien trong tab "Workspace" cua profile. Chua nhieu KnowledgeGroup,
// moi group chua nhieu Document ("bài viết" - ten model backend van la
// Document, chi doi ten hien thi o UI).
export type ApiWorkspace = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiKnowledgeGroupVisibility = "PUBLIC" | "PRIVATE";
export type ApiKnowledgeGroupCollabStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ApiKnowledgeGroupCollabRequest = {
  id: string;
  status: ApiKnowledgeGroupCollabStatus;
  joinReason: string | null;
  createdAt: string;
  user: { username: string; name: string; avatarUrl: string };
};

// visibility CHI gate quyen XEM - quyen GHI (tao bai) luon la chu workspace +
// collaborator APPROVED, bat ke visibility. `pendingRequests` chi khac rong
// khi viewer la chu workspace (xem KnowledgeGroupService.findForWorkspace).
export type ApiKnowledgeGroup = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  visibility: ApiKnowledgeGroupVisibility;
  postCount: number;
  orderIndex: number;
  viewerCanWrite: boolean;
  pendingRequests: ApiKnowledgeGroupCollabRequest[];
  createdAt: string;
  updatedAt: string;
};

export type ApiWorkspaceWithGroups = ApiWorkspace & {
  groups: ApiKnowledgeGroup[];
};

// "Bài viết" trong 1 Knowledge Group - do nguoi dung soan bang editor lon,
// `content` la Tiptap JSON. Ten model backend van la Document (xem comment
// trong schema.prisma), UI goi la "bài viết".
export type ApiDocumentAuthor = {
  username: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export type ApiDocument = {
  id: string;
  knowledgeGroupId: string;
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
