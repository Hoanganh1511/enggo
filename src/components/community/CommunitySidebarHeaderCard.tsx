import Image from "next/image";
import { Globe2, Lock, Code2, ChevronRight } from "lucide-react";
import type { Community } from "@/lib/community/types";
import { formatCompact } from "@/lib/format-number";

// Card "Cong dong" dung chung cho ca 2 sidebar (Member: CommunityChannelSidebar,
// Admin: CommunityAdminSidebar) - truoc day copy 2 noi, tach ra day de sua 1 cho.
export function CommunitySidebarHeaderCard({
  community,
  adminBadge,
}: {
  community: Community;
  adminBadge?: boolean;
}) {
  const previewMembers = community.activeMembers.slice(0, 3);

  return (
    <div className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-header-background px-3 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-community-accent to-community-accent-dark text-white shadow-sm">
        <Code2 size={18} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Cộng đồng
        </p>
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-bold text-ink">
            {community.name}
          </p>
          {adminBadge && (
            <span className="shrink-0 rounded-sm bg-community-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Admin
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 text-xs text-ink-faint">
          {community.isPublic ? (
            <Globe2 size={11} strokeWidth={2} className="shrink-0" />
          ) : (
            <Lock size={11} strokeWidth={2} className="shrink-0" />
          )}
          <span className="truncate">
            {community.isPublic ? "Public community" : "Private community"}
          </span>
        </p>
        {previewMembers.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {previewMembers.map((member) => (
                <Image
                  key={member.name}
                  src={member.avatarUrl}
                  alt={member.name}
                  width={18}
                  height={18}
                  className="size-4.5 shrink-0 rounded-full border-2 border-surface object-cover"
                />
              ))}
            </div>
            <span className="truncate text-xs text-ink-faint">
              {formatCompact(community.memberCount)} thành viên
            </span>
          </div>
        )}
      </div>
      <ChevronRight
        size={16}
        strokeWidth={2}
        className="shrink-0 text-ink-faint"
      />
    </div>
  );
}
