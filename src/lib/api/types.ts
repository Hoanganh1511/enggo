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
  // Ten export cua 1 icon lucide-react (vd "BookOpen") - null = chua chon,
  // FE fallback ve icon Folder. Xem group-icons.tsx.
  icon: string | null;
  // Ten/ma chung chi MUC TIEU cua nhom (vd "AWS Solutions Architect"/"SAA-C03") -
  // null = chua thiet lap, GroupProgressWidget.tsx an di. Sua qua
  // GroupCertSettingsModal.tsx.
  certName: string | null;
  certCode: string | null;
  // "Muc tieu" cua nhom - Tiptap JSON, schema HAN CHE giong Document.overview
  // (bold/italic/bulletList/orderedList, xem GroupGoalModal.tsx). Metadata
  // cong khai (giong description) - AI cung xem duoc, chi chu workspace sua.
  goal: Record<string, unknown> | null;
  // "Lo trinh hoc tap" - Tiptap JSON, schema DAY DU (getPostExtensions(),
  // giong Document.content) - hien o GroupRoadmapSection.tsx, KHAC goal
  // (schema han che, chi 1 doan ngan).
  roadmap: Record<string, unknown> | null;
  visibility: ApiKnowledgeGroupVisibility;
  postCount: number;
  orderIndex: number;
  viewerCanWrite: boolean;
  pendingRequests: ApiKnowledgeGroupCollabRequest[];
  // Gop tu Checklist cua moi bai trong nhom - CHI co trong response cua
  // WorkspaceService.listByOwnerWithGroups (dung cho KnowledgeTreeCanvas.tsx),
  // KnowledgeGroupService.findForWorkspace KHONG tra ve field nay.
  checklistTotal?: number;
  checklistUnderstood?: number;
  createdAt: string;
  updatedAt: string;
};

// So lieu cho GroupProgressWidget.tsx - certName/certCode/postCount KHONG
// lap lai o day (da co san tren ApiKnowledgeGroup). Xem
// KnowledgeGroupService.getProgress o backend.
export type ApiGroupProgress = {
  progressPercent: number;
  totalStudyDays: number;
  topicCount: number;
  currentStreak: number;
};

export type ApiWorkspaceWithGroups = ApiWorkspace & {
  groups: ApiKnowledgeGroup[];
};

// Dung cho strip "Gợi ý từ người bạn theo dõi" o man chon workspace
// (WorkspaceSwitcher.tsx) - xem WorkspaceService.listSuggested o backend.
// KHAC ApiWorkspaceWithGroups: khong keo `groups` day du (chi can 1 con so
// tong), nhung co them `owner` (workspace cua NHIEU nguoi khac nhau, can biet
// cua ai de hien avatar/ten + dieu huong dung /workspace/:username/:id).
export type ApiSuggestedWorkspace = ApiWorkspace & {
  owner: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  groupCount: number;
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

// Nhom "cung chu de" (tuy chon) - xem DocumentSeries trong schema.prisma.
export type ApiSeries = {
  id: string;
  knowledgeGroupId: string;
  name: string;
  category: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiDocument = {
  id: string;
  knowledgeGroupId: string;
  slug: string;
  title: string;
  summary: string | null;
  // Tong quan noi dung - Tiptap JSON, schema han che (xem
  // getOverviewExtensions() trong post-extensions.ts). Hien thanh 1 box duoi
  // tieu de trong danh sach bai viet - KHAC voi `summary` (plain text) va
  // `content` (bai day du).
  overview: Record<string, unknown> | null;
  coverImageUrl: string | null;
  content: Record<string, unknown>;
  tags: string[];
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  // Ban rut gon cua DocumentSeries (id+name+category) - null neu bai khong
  // thuoc series nao, xem ApiSeries cho shape day du (dung khi quan ly series).
  series: { id: string; name: string; category: string | null } | null;
  // Bat/tat hien thi lich su checklist (ChecklistItemLog) cho nguoi doc
  // khac - xem ArticleChecklist.tsx.
  checklistLogPublic: boolean;
  // Tien do "Kế hoạch học tập" cua bai (tong so muc / so muc da nam) - dung
  // hien trong ArticleCard.tsx danh sach bai viet. checklistTotal === 0 nghia
  // la bai chua thiet lap muc tieu nao.
  checklistTotal: number;
  checklistUnderstood: number;
  author: ApiDocumentAuthor;
};

// NOT_UNDERSTOOD/UNDERSTOOD la 2 gia tri GOC (giu nguyen ten khop voi enum
// backend) - IN_PROGRESS/NEEDS_REVIEW la 2 trang thai them cho "Ke hoach hoc
// tap" (○ Chua hoc / ◐ Dang hoc / ✓ Da nam / ⚠ Can on).
export type ChecklistStatus =
  | "NOT_UNDERSTOOD"
  | "IN_PROGRESS"
  | "UNDERSTOOD"
  | "NEEDS_REVIEW";

// Section trong "Ke hoach hoc tap" (xem ArticleChecklist.tsx).
export type ChecklistGroup = "OBJECTIVE" | "RESOURCE" | "PRACTICE" | "ASSESSMENT";

export type ApiChecklistItem = {
  id: string;
  documentId: string;
  label: string;
  status: ChecklistStatus;
  group: ChecklistGroup;
  note: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiChecklistItemLog = {
  id: string;
  toStatus: ChecklistStatus;
  note: string | null;
  createdAt: string;
};

// "Mục tiêu học tập" cua 1 nhom - danh sach NHIEU LearningObjective (vd "1.1
// Design secure access to AWS resources"), khac han KnowledgeGroup.goal (1 o
// rich-text tu do cua ca nhom - xem GroupGoalModal.tsx, khong lien quan).
// KNOWLEDGE = "biet", SKILL = "lam duoc" - xem GroupGoalsSection.tsx.
export type ApiObjectiveItemType = "KNOWLEDGE" | "SKILL";

export type ApiObjectiveItem = {
  id: string;
  objectiveId: string;
  type: ApiObjectiveItemType;
  label: string;
  status: ChecklistStatus;
  note: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiObjective = {
  id: string;
  knowledgeGroupId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  items: ApiObjectiveItem[];
};

// Ban rut gon cho danh sach (khong keo `content`).
export type ApiDocumentSummary = Omit<ApiDocument, "content">;

// 1 luot hoi/dap voi Tro ly AI cua workspace - client giu nguyen mang nay
// (khong luu DB) va gui lai het moi lan hoi tiep de giu ngu canh nhieu luot.
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// He thong thong bao - phuc vu luong yeu cau cong tac nhom kien thuc va
// follow (xem NotificationService o backend). `collabId` dung de FE goi
// thang endpoint duyet/tu choi tu chinh dropdown thong bao (tab "Yêu cầu"),
// KHONG phai 1 quan he Prisma that (xem comment trong schema.prisma).
export type ApiNotificationType =
  | "GROUP_COLLAB_REQUESTED"
  | "GROUP_COLLAB_APPROVED"
  | "GROUP_COLLAB_REJECTED"
  | "FOLLOW";

export type ApiNotification = {
  id: string;
  type: ApiNotificationType;
  actor: {
    id: string;
    username: string | null;
    name: string;
    avatarUrl: string | null;
  } | null;
  group: {
    id: string;
    name: string;
    workspaceId: string;
    ownerUsername: string | null;
  } | null;
  collabId: string | null;
  read: boolean;
  createdAt: string;
};

export type ApiNotificationPage = {
  items: ApiNotification[];
  nextCursor: string | null;
};

// Chat 1-1 that (khac han ChatMessage o tren - do la Q&A voi Tro ly AI,
// khong luu DB). Xem ChatService o backend.
export type ApiConversationUser = {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
  verified: boolean;
  // Snapshot tai thoi diem fetch /conversations - cap nhat real-time qua
  // socket event "presence:update" (xem use-chat-socket.ts).
  online: boolean;
};

export type ApiMessageType = "TEXT" | "IMAGE" | "FILE" | "VOICE" | "GIF" | "POLL";

export type ApiPollOption = {
  id: string;
  text: string;
  voteCount: number;
  votedByMe: boolean;
};

export type ApiPoll = {
  id: string;
  messageId: string;
  question: string;
  options: ApiPollOption[];
  totalVotes: number;
};

export type ApiChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: ApiMessageType;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentMimeType: string | null;
  attachmentSize: number | null;
  durationSeconds: number | null;
  poll: ApiPoll | null;
  createdAt: string;
  // Chi co gia tri tren su kien socket "chat:message" (xem ChatService.sendMessage
  // o backend) - REST (listMessages) khong tra ve 2 field nay. Dung de hien
  // browser Notification ma khong can fetch rieng thong tin nguoi gui.
  senderName?: string | null;
  senderAvatarUrl?: string | null;
};

export type ApiConversationSummary = {
  id: string;
  otherUser: ApiConversationUser | null;
  lastMessage: ApiChatMessage | null;
  unreadCount: number;
  updatedAt: string;
  // Snapshot tai thoi diem fetch - cap nhat real-time qua socket event
  // "chat:read" (xem use-chat-socket.ts).
  otherLastReadAt: string | null;
};

export type ApiChatMessagePage = {
  items: ApiChatMessage[];
  nextCursor: string | null;
};

// Payload cua socket event "presence:update" - xem NotificationGateway.
export type ApiPresenceUpdate = {
  userId: string;
  online: boolean;
};

// Payload cua socket event "chat:typing" - trang thai tam thoi, khong luu DB.
export type ApiTypingEvent = {
  conversationId: string;
  userId: string;
};

// Payload cua socket event "chat:read".
export type ApiReadEvent = {
  conversationId: string;
  readAt: string;
};
