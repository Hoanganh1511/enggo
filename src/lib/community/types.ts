export type CommunityKnowledgeBranch = {
  label: string;
  accent: string;
  progressPercent: number;
};

export type CommunityAuthorProfile = {
  level: number;
  professionLine: string;
  contributorLabel: string;
  totalXp: number;
  answerCount: number;
  resourceCount: number;
  helpfulCount: number;
  joinedDaysAgo: number;
};

export type CommunityAuthor = {
  name: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
  knowledgeBranches?: CommunityKnowledgeBranch[];
  profile?: CommunityAuthorProfile;
};

export type ChannelMessageReaction = { emoji: string; count: number };

export type ChannelMessageTopReply = {
  author: CommunityAuthor;
  authorBadge?: string;
  timeLabel: string;
  content: string;
  moreCount: number;
};

export type ChannelMessageCategory = "learning" | "question" | "resource";

export type ChannelMessage = {
  id: string;
  author: CommunityAuthor;
  authorBadge?: string;
  authorTitle?: string;
  timeLabel: string;
  actionLabel?: string;
  topicTag?: string;
  categoryTag?: string;
  category?: ChannelMessageCategory;
  title?: string;
  content: string;
  bulletPoints?: string[];
  codeBlock?: { language: string; code: string };
  imageUrl?: string;
  attachmentName?: string;
  attachmentMeta?: string;
  xp?: { amount: number; label: string };
  progressPercent?: number;
  reactions: ChannelMessageReaction[];
  replyCount: number;
  topReply?: ChannelMessageTopReply;
};

export type CommunityChannelGroup = "knowledge" | "tools";

export type CommunityPinnedPost = {
  authorName: string;
  authorBadge?: string;
  timeLabel: string;
  title: string;
  attachmentName?: string;
  likes: number;
  comments: number;
};

// "id" moi them (so voi ban mock cu) - can de goi API can channel that.
export type CommunityChannel = {
  id: string;
  slug: string;
  name: string;
  group: CommunityChannelGroup;
  description: string;
  messageCount: number;
  bannerImageUrl?: string;
  pinnedMessage?: {
    author: CommunityAuthor;
    timeLabel: string;
    title: string;
    excerpt: string;
  };
  pinnedPosts?: CommunityPinnedPost[];
  messages: ChannelMessage[];
};

export type CommunityResourceKind = "doc" | "pdf" | "video" | "link";

export type CommunityLinkDoc = {
  title: string;
  meta: string;
  kind?: CommunityResourceKind;
};

export type CommunityUsefulLink = {
  title: string;
  domain: string;
  kind?: CommunityResourceKind;
};

export type CommunityActiveMember = {
  name: string;
  avatarUrl: string;
  statusLabel: string;
  roleBadge?: string;
  points?: number;
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

export type CommunityChannelRequestStatus = "pending" | "approved" | "rejected";

export type CommunityChannelRequest = {
  id: string;
  slug: string;
  name: string;
  description: string;
  requesterName: string;
  requesterAvatarUrl: string;
  submittedLabel: string;
  status: CommunityChannelRequestStatus;
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

// "id"/"viewerIsMember" moi them - can cho join/leave/composer goi API that.
export type Community = {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
  isPublic: boolean;
  isOwner: boolean;
  viewerIsMember: boolean;
  description: string;
  channels: CommunityChannel[];
  docsAndLinks: CommunityLinkDoc[];
  usefulLinks: CommunityUsefulLink[];
  activeMembers: CommunityActiveMember[];
  joinRequests: CommunityJoinRequestDetailed[];
  channelRequests: CommunityChannelRequest[];
  adminStats: CommunityAdminStat[];
  recentActivity: CommunityActivityItem[];
};
