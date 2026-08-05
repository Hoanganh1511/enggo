"use client";

import { useState } from "react";
import type { Community } from "@/content/community-mock";
import { CommunityChannelSidebar } from "./CommunityChannelSidebar";
import { CommunityChatView } from "./CommunityChatView";
import { CommunityRightPanelMember } from "./CommunityRightPanelMember";
import {
  CommunityAdminSidebar,
  type AdminSection,
} from "./CommunityAdminSidebar";
import { CommunityAdminOverview } from "./CommunityAdminOverview";
import { CommunityJoinRequestsPanel } from "./CommunityJoinRequestsPanel";
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

// Dieu phoi giao dien Community - re nhanh theo community.isOwner (chu
// series): true -> giao dien ADMIN (sidebar quan tri + duyet yeu cau tham
// gia), false -> giao dien MEMBER (kenh chat). Day la quyet dinh DA XAC NHAN
// truoc khi lam (khong phai toggle thu cong) - xem docs/engineering-log.md.
export function CommunityWorkspace({ community }: { community: Community }) {
  const knowledgeChannels = community.channels.filter(
    (c) => c.group === "knowledge",
  );
  const [activeChannelSlug, setActiveChannelSlug] = useState(
    knowledgeChannels[0]?.slug ?? "",
  );
  // Mac dinh "requests" (khong phai "overview") de khop dung man hinh Admin
  // duoc mo ta trong thiet ke tham khao.
  const [activeAdminSection, setActiveAdminSection] =
    useState<AdminSection>("requests");

  if (community.isOwner) {
    const pendingCount = community.joinRequests.filter(
      (r) => r.status === "pending",
    ).length;

    return (
      <div className="flex h-full min-h-0 bg-[url('/bg-community.png')] bg-cover bg-center">
        <CommunityAdminSidebar
          community={community}
          activeSection={activeAdminSection}
          onSelectSection={setActiveAdminSection}
          pendingRequestCount={pendingCount}
        />

        {activeAdminSection === "overview" && (
          <CommunityAdminOverview community={community} />
        )}
        {activeAdminSection === "requests" && (
          <CommunityJoinRequestsPanel
            initialRequests={community.joinRequests}
          />
        )}
        {activeAdminSection !== "overview" &&
          activeAdminSection !== "requests" && (
            <CommunityAdminPlaceholder
              label={ADMIN_SECTION_LABEL[activeAdminSection]}
            />
          )}

        <CommunityRightPanelAdmin community={community} />
      </div>
    );
  }

  const activeChannel = knowledgeChannels.find(
    (c) => c.slug === activeChannelSlug,
  );

  return (
    <div className="flex h-full min-h-0 bg-[url('/bg-community.png')] bg-cover bg-center">
      <CommunityChannelSidebar
        community={community}
        activeChannelSlug={activeChannelSlug}
        onSelectChannel={setActiveChannelSlug}
      />

      {activeChannel ? (
        <CommunityChatView channel={activeChannel} />
      ) : (
        <div className="flex h-full flex-1 items-center justify-center py-4 pl-6 text-sm text-ink-faint">
          Cộng đồng này chưa có kênh nào.
        </div>
      )}

      <CommunityRightPanelMember community={community} channel={activeChannel} />
    </div>
  );
}
