import { formatRelativeTime } from "@/lib/career-tree/format-time";
import type {
  ApiChannel,
  ApiCommunity,
  ApiCommunityPost,
} from "@/lib/api/types";
import type { Community, ChannelMessage, CommunityChannel } from "./types";

const GROUP_LABEL: Record<string, "knowledge" | "tools"> = {
  KNOWLEDGE: "knowledge",
  TOOLS: "tools",
};

const CATEGORY_TAG_LABEL: Record<string, string> = {
  learning: "🏆 Learning Update",
  question: "❓ Question",
  resource: "📚 Resource",
};

function formatBytes(bytes?: number): string | undefined {
  if (!bytes) return undefined;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function adaptChannel(
  api: ApiChannel,
): Omit<CommunityChannel, "messages"> {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    group: GROUP_LABEL[api.group],
    description: api.description,
    messageCount: api.messageCount,
    bannerImageUrl: api.bannerImageUrl ?? undefined,
  };
}

export function adaptPost(api: ApiCommunityPost): ChannelMessage {
  return {
    id: api.id,
    author: {
      name: api.author.name,
      username: api.author.username,
      avatarUrl: api.author.avatarUrl,
      verified: api.author.verified,
    },
    timeLabel: formatRelativeTime(api.createdAt),
    category: api.category ?? undefined,
    categoryTag: api.category ? CATEGORY_TAG_LABEL[api.category] : undefined,
    title: api.title ?? undefined,
    content: api.content,
    bulletPoints: api.bulletPoints,
    codeBlock: api.codeBlock,
    imageUrl: api.imageUrl,
    topicTag: api.topicTag,
    actionLabel: api.actionLabel,
    attachmentName: api.attachmentName,
    attachmentMeta: api.attachmentMeta ?? formatBytes(api.attachmentSizeBytes),
    reactions: api.reactions,
    replyCount: api.commentsCount,
    topReply: api.topReply
      ? {
          author: {
            name: api.topReply.author.name,
            avatarUrl: api.topReply.author.avatarUrl,
            username: "",
            verified: false,
          },
          timeLabel: formatRelativeTime(api.topReply.createdAt),
          content: api.topReply.content,
          moreCount: Math.max(0, api.commentsCount - 1),
        }
      : undefined,
  };
}

export function splitPinned(apiPosts: ApiCommunityPost[]) {
  const pinnedApi = apiPosts.filter((p) => p.isPinned);
  const rest = apiPosts.filter((p) => !p.isPinned).map(adaptPost);

  if (pinnedApi.length === 0)
    return { pinnedMessage: undefined, pinnedPosts: undefined, messages: rest };

  if (pinnedApi.length === 1) {
    const p = pinnedApi[0];
    return {
      pinnedMessage: {
        author: {
          name: p.author.name,
          avatarUrl: p.author.avatarUrl,
          username: p.author.username,
          verified: p.author.verified,
        },
        timeLabel: formatRelativeTime(p.createdAt),
        title: p.title ?? p.content.slice(0, 60),
        excerpt: p.content,
      },
      pinnedPosts: undefined,
      messages: rest,
    };
  }

  return {
    pinnedMessage: undefined,
    pinnedPosts: pinnedApi.map((p) => ({
      authorName: p.author.name,
      timeLabel: formatRelativeTime(p.createdAt),
      title: p.title ?? p.content.slice(0, 60),
      attachmentName: p.attachmentName,
      likes: p.reactions.reduce((sum, r) => sum + r.count, 0),
      comments: p.commentsCount,
    })),
    messages: rest,
  };
}

export function adaptCommunity(api: ApiCommunity): Community {
  const isOwner = api.viewer.role === "OWNER" || api.viewer.role === "ADMIN";
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    memberCount: api.memberCount,
    isPublic: api.isPublic,
    isOwner,
    viewerIsMember: api.viewer.isMember,
    description: api.description,
    channels: api.channels.map((c) => ({ ...adaptChannel(c), messages: [] })),
    docsAndLinks: [],
    usefulLinks: [],
    activeMembers: [],
    joinRequests: api.joinRequests.map((r) => ({
      id: r.id,
      name: r.user.name,
      avatarUrl: r.user.avatarUrl ?? "",
      email: r.user.email,
      experienceLabel: "",
      reason: r.joinReason ?? "",
      submittedLabel: formatRelativeTime(r.createdAt),
      status: r.status.toLowerCase() as "pending" | "approved" | "rejected",
    })),
    channelRequests: api.channelRequests.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      requesterName: r.requestedBy?.name ?? "Không rõ",
      requesterAvatarUrl: r.requestedBy?.avatarUrl ?? "",
      submittedLabel: formatRelativeTime(r.createdAt),
      status: r.status.toLowerCase() as "pending" | "approved" | "rejected",
    })),
    adminStats: [],
    recentActivity: [],
  };
}
