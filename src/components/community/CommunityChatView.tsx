"use client";

import { useMemo, useState } from "react";
import { Paperclip, Star, ThumbsUp, MessageCircle } from "lucide-react";

import { CommunityPostCard } from "./CommunityPostCard";
import { CommunityComposer } from "./CommunityComposer";
import {
  KnowledgeCommandBar,
  DEFAULT_KNOWLEDGE_FILTERS,
  type KnowledgeFilters,
} from "./KnowledgeCommandBar";
import type {
  CommunityChannel,
  ChannelMessage,
  Community,
} from "@/lib/community/types";
import { createChannelPostAction } from "@/actions/community/create-channel-post";

function messageReactionTotal(message: ChannelMessage) {
  return message.reactions.reduce((sum, r) => sum + r.count, 0);
}

// Loc + sap xep channel.messages theo KnowledgeFilters - tach rieng ham nay
// de KnowledgeCommandBar.tsx chi lo UI/state, con logic loc nam o day (noi
// thuc su render danh sach).
function filterMessages(messages: ChannelMessage[], filters: KnowledgeFilters) {
  let list = messages;

  if (filters.category === "learning")
    list = list.filter((m) => m.category === "learning");
  else if (filters.category === "question")
    list = list.filter((m) => m.category === "question");
  else if (filters.category === "resource")
    list = list.filter((m) => m.category === "resource");
  else if (filters.category === "mentor")
    list = list.filter((m) => m.authorBadge === "Mentor");

  if (filters.mentorOnly) list = list.filter((m) => m.authorBadge === "Mentor");
  if (filters.hasFile) list = list.filter((m) => !!m.attachmentName);
  if (filters.hasCode) list = list.filter((m) => !!m.codeBlock);

  const query = filters.search.trim().toLowerCase();
  if (query) {
    list = list.filter(
      (m) =>
        m.title?.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query),
    );
  }

  if (filters.mostHelpful) {
    list = [...list].sort(
      (a, b) => messageReactionTotal(b) - messageReactionTotal(a),
    );
  }

  return list;
}

// Noi dung chinh cho giao dien MEMBER khi dang xem 1 kenh - bo cuc dang
// DIEN DAN (bai ghim + feed bai viet), thay the hoan toan kieu chat bubble
// Discord/Slack truoc day. Tab "Tài liệu/Link/Tệp đính kèm" KHONG con o day -
// da chuyen sang right panel (CommunityChannelDrawer.tsx, mo bang drawer
// truot tu phai thay vi doi noi dung inline o day). Composer KHONG con dinh
// o cuoi kenh nua - gio la 1 MODAL (CommunityComposer.tsx), mo tu
// KnowledgeCommandBar.tsx (thay group nut "Đăng bài" don gian truoc day).
export function CommunityChatView({
  channel,
  community,
  loading,
  composerOpenChannelId,
  onComposerOpenChange,
}: {
  channel: CommunityChannel;
  community: Community;
  loading?: boolean;
  composerOpenChannelId: string | null;
  onComposerOpenChange: (open: boolean) => void;
}) {
  const composerOpen = composerOpenChannelId === channel.id;
  const [filters, setFilters] = useState<KnowledgeFilters>(
    DEFAULT_KNOWLEDGE_FILTERS,
  );
  const [scrolled, setScrolled] = useState(false);

  const pinnedCount =
    (channel.pinnedPosts?.length ?? 0) + (channel.pinnedMessage ? 1 : 0);
  const mentorCount = useMemo(
    () => channel.messages.filter((m) => m.authorBadge === "Mentor").length,
    [channel.messages],
  );
  const learningCount = useMemo(
    () => channel.messages.filter((m) => m.category === "learning").length,
    [channel.messages],
  );
  const questionCount = useMemo(
    () => channel.messages.filter((m) => m.category === "question").length,
    [channel.messages],
  );
  const resourceCount = useMemo(
    () => channel.messages.filter((m) => m.category === "resource").length,
    [channel.messages],
  );
  const visibleMessages = useMemo(
    () => filterMessages(channel.messages, filters),
    [channel.messages, filters],
  );

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col py-3 px-3 overflow-hidden ">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <KnowledgeCommandBar
          channelName={channel.name}
          totalCount={channel.messages.length}
          learningCount={learningCount}
          questionCount={questionCount}
          resourceCount={resourceCount}
          pinnedCount={pinnedCount}
          mentorCount={mentorCount}
          filters={filters}
          onFiltersChange={setFilters}
          onCreatePost={() => onComposerOpenChange(true)}
        />

        {/* Wrapper "relative" rieng, sat ngay duoi KnowledgeCommandBar - de
            lop phu mo/blur ben duoi dinh vi dung theo mep tren cua VUNG
            CUON, khong phai mep tren cua ca khoi (se bi lech xuong duoi
            KnowledgeCommandBar neu dat "relative" o wrapper ngoai cung). */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* "mr-[-8px] pr-2" - bu tru dung 8px (dung bang be rong scrollbar
              trong globals.css) de scrollbar noi vao vung padding "px-3" cua
              div goc (con du 12px), khong an vao be rong that cua post card
              ben trong nua. */}
          <div
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
            className="-mr-2 rounded-md flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            {channel.pinnedPosts && channel.pinnedPosts.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                    <Star size={12} strokeWidth={2} />
                    Bài viết được ghim
                  </p>
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-medium text-community-accent hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {channel.pinnedPosts.map((post) => (
                    <div
                      key={post.title}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-ink">
                          <span className="truncate">{post.authorName}</span>
                          {post.authorBadge && (
                            <span className="shrink-0 text-[10px] text-warning">
                              {post.authorBadge}
                            </span>
                          )}
                        </span>
                        <Star
                          size={12}
                          strokeWidth={2}
                          className="shrink-0 text-warning"
                          fill="currentColor"
                        />
                      </div>
                      <p className="text-[11px] text-ink-faint">
                        {post.timeLabel}
                      </p>
                      <p className="line-clamp-2 text-sm font-medium text-ink">
                        {post.title}
                      </p>
                      {post.attachmentName && (
                        <span className="flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 text-xs text-ink-muted">
                          <Paperclip
                            size={12}
                            strokeWidth={2}
                            className="shrink-0"
                          />
                          <span className="truncate">
                            {post.attachmentName}
                          </span>
                        </span>
                      )}
                      <div className="flex items-center gap-3 text-xs text-ink-faint">
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} strokeWidth={2} />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} strokeWidth={2} />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className=" flex flex-col gap-2 pb-3">
              {loading && (
                <p className="py-12 text-center text-sm text-ink-faint">
                  Đang tải bài viết...
                </p>
              )}
              {channel.messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-faint">
                  Chưa có bài viết nào trong kênh này.
                </p>
              ) : visibleMessages.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-faint">
                  Không có bài viết nào khớp với bộ lọc hiện tại.
                </p>
              ) : (
                visibleMessages.map((message) => (
                  <CommunityPostCard key={message.id} message={message} />
                ))
              )}
            </div>
          </div>

          {scrolled && (
            // "mask-image" de CHINH DO BLUR cung mo dan theo gradient, khong
            // chi mau nen mo dan - backdrop-blur-sm truoc do la 1 dai blur
            // DEU rồi CAT CUT dot ngot o mep duoi, nhin thay ranh gioi ro.
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-md bg-linear-to-b from-background/90 to-transparent backdrop-blur-sm mask-[linear-gradient(to_bottom,black,transparent)]" />
          )}
        </div>
      </div>

      <CommunityComposer
        open={composerOpen}
        onOpenChange={onComposerOpenChange}
        channelId={channel.id}
        slug={community.slug}
      />
    </div>
  );
}
