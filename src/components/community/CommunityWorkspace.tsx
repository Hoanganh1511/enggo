"use client";

import { useEffect, useState, useTransition } from "react";
import type { Community, ChannelMessage } from "@/lib/community/types";
import { splitPinned } from "@/lib/community/adapt";
import { listChannelPostsAction } from "@/actions/community/list-channel-posts";
import { CommunityChannelSidebar } from "./CommunityChannelSidebar";
import { CommunityChatView } from "./CommunityChatView";
import { CommunityRightPanelMember } from "./CommunityRightPanelMember";
import {
  CommunityAdminSidebar,
  type AdminSection,
} from "./CommunityAdminSidebar";
import { CommunityAdminOverview } from "./CommunityAdminOverview";
import { CommunityJoinRequestsPanel } from "./CommunityJoinRequestsPanel";
import { CommunityChannelRequestsPanel } from "./CommunityChannelRequestsPanel";
import { CommunityAdminPlaceholder } from "./CommunityAdminPlaceholder";
import { CommunityRightPanelAdmin } from "./CommunityRightPanelAdmin";

const ADMIN_SECTION_LABEL: Record<AdminSection, string> = {
  overview: "Tổng quan",
  requests: "Yêu cầu tham gia",
  members: "Thành viên",
  channels: "Kênh & Danh mục",
  pinned: "Nội dung ghim",
  docs: "Tài liệu & Link",
  events: "Sự kiện",
  stats: "Thống kê",
  settings: "Cài đặt cộng đồng",
};

type ChannelPostsState = Record<
  string,
  { messages: ChannelMessage[]; pinnedMessage?: unknown; pinnedPosts?: unknown }
>;

export function CommunityWorkspace({ community }: { community: Community }) {
  const knowledgeChannels = community.channels.filter(
    (c) => c.group === "knowledge",
  );
  const [activeChannelSlug, setActiveChannelSlug] = useState(
    knowledgeChannels[0]?.slug ?? "",
  );
  const [activeAdminSection, setActiveAdminSection] =
    useState<AdminSection>("requests");
  // Che do dang xem: "channel" (giao dien thanh vien binh thuong - MAC DINH
  // cho MOI NGUOI, ke ca owner/admin) hoac "admin" (chi owner/admin bam vao
  // "Quản trị cộng đồng" moi vao duoc). Truoc day component nay RE NHANH
  // theo community.isOwner nen admin/owner KHONG BAO GIO thay duoc kenh/bai
  // viet/composer - day la loi that, admin van can day du tinh nang cua 1
  // thanh vien binh thuong, chi co THEM quyen quan tri chu khong phai THAY
  // THE hoan toan giao dien thanh vien.
  const [view, setView] = useState<"channel" | "admin">("channel");
  const [channelPosts, setChannelPosts] = useState<ChannelPostsState>({});
  const [isLoadingPosts, startTransition] = useTransition();
  const [composerOpenChannelId, setComposerOpenChannelId] = useState<
    string | null
  >(null);

  const activeChannel = knowledgeChannels.find(
    (c) => c.slug === activeChannelSlug,
  );

  useEffect(() => {
    if (!activeChannel || channelPosts[activeChannel.slug]) return;
    startTransition(async () => {
      const apiPosts = await listChannelPostsAction(activeChannel.id);
      const split = splitPinned(apiPosts);
      setChannelPosts((prev) => ({ ...prev, [activeChannel.slug]: split }));
    });
  }, [activeChannel, channelPosts]);

  if (community.isOwner && view === "admin") {
    const pendingCount = community.joinRequests.filter(
      (r) => r.status === "pending",
    ).length;
    return (
      <div className="flex h-full min-h-0 community-wallpaper">
        <CommunityAdminSidebar
          community={community}
          activeSection={activeAdminSection}
          onSelectSection={setActiveAdminSection}
          pendingRequestCount={pendingCount}
          pendingChannelCount={community.channelRequests.length}
          onBackToChannels={() => setView("channel")}
        />
        {activeAdminSection === "overview" && (
          <CommunityAdminOverview community={community} />
        )}
        {activeAdminSection === "requests" && (
          <CommunityJoinRequestsPanel
            communityId={community.id}
            communitySlug={community.slug}
            initialRequests={community.joinRequests}
          />
        )}
        {activeAdminSection === "channels" && (
          <CommunityChannelRequestsPanel
            communityId={community.id}
            communitySlug={community.slug}
            initialRequests={community.channelRequests}
          />
        )}
        {activeAdminSection !== "overview" &&
          activeAdminSection !== "requests" &&
          activeAdminSection !== "channels" && (
            <CommunityAdminPlaceholder
              label={ADMIN_SECTION_LABEL[activeAdminSection]}
            />
          )}
        <CommunityRightPanelAdmin community={community} />
      </div>
    );
  }

  const loadedPosts = activeChannel
    ? channelPosts[activeChannel.slug]
    : undefined;
  const resolvedChannel = activeChannel
    ? {
        ...activeChannel,
        messages: loadedPosts?.messages ?? [],
        pinnedMessage:
          (loadedPosts?.pinnedMessage as never) ?? activeChannel.pinnedMessage,
        pinnedPosts:
          (loadedPosts?.pinnedPosts as never) ?? activeChannel.pinnedPosts,
      }
    : undefined;

  return (
    <div className="flex h-full min-h-0 community-wallpaper">
      <CommunityChannelSidebar
        community={community}
        activeChannelSlug={activeChannelSlug}
        onSelectChannel={setActiveChannelSlug}
        onOpenAdmin={community.isOwner ? () => setView("admin") : undefined}
      />
      {resolvedChannel ? (
        <CommunityChatView
          channel={resolvedChannel}
          loading={isLoadingPosts}
          community={community}
          composerOpenChannelId={composerOpenChannelId}
          onComposerOpenChange={(open) =>
            setComposerOpenChannelId(open ? resolvedChannel.id : null)
          }
        />
      ) : (
        <div className="flex h-full flex-1 items-center justify-center py-4 pl-6 text-sm text-ink-faint">
          Cộng đồng này chưa có kênh nào.
        </div>
      )}
      <CommunityRightPanelMember
        community={community}
        channel={resolvedChannel}
      />
    </div>
  );
}
