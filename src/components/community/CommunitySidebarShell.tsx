import type { ReactNode } from "react";
import type { Community } from "@/content/community-mock";
import { CommunitySidebarHeaderCard } from "./CommunitySidebarHeaderCard";

// Khung <aside> dung chung cho ca 2 sidebar (Member: CommunityChannelSidebar,
// Admin: CommunityAdminSidebar) - gom ca className lap lai lan header card,
// truoc day copy 2 noi.
export function CommunitySidebarShell({
  community,
  adminBadge,
  children,
}: {
  community: Community;
  adminBadge?: boolean;
  children: ReactNode;
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-4 overflow-y-auto shadow-lg py-4 p-4 bg-white">
      <CommunitySidebarHeaderCard
        community={community}
        adminBadge={adminBadge}
      />
      {children}
    </aside>
  );
}
