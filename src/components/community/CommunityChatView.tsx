"use client";

import { Pin, Paperclip, Star, ThumbsUp, MessageCircle } from "lucide-react";
import type { CommunityChannel } from "@/content/community-mock";
import { CommunityPostCard } from "./CommunityPostCard";
import { CommunityComposer } from "./CommunityComposer";

// Noi dung chinh cho giao dien MEMBER khi dang xem 1 kenh - bo cuc dang
// DIEN DAN (bai ghim + feed bai viet), thay the hoan toan kieu chat bubble
// Discord/Slack truoc day. Tab "Tài liệu/Link/Tệp đính kèm" KHONG con o day -
// da chuyen sang right panel (CommunityChannelDrawer.tsx, mo bang drawer
// truot tu phai thay vi doi noi dung inline o day).
export function CommunityChatView({ channel }: { channel: CommunityChannel }) {
  return (
    // "h-full" + KHONG overflow o chinh no - chi phan feed ben duoi
    // (min-h-0 overflow-y-auto) moi tu cuon, de composer o duoi LUON co
    // dinh, khong bi cuon theo. Hero kenh KHONG con o day nua - da chuyen
    // sang CommunityChannelInfoCard.tsx trong right panel.
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden py-4 pr-6 pl-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl bg-white/85 p-4 backdrop-blur-md">
        {channel.pinnedMessage && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-community-accent/10 bg-linear-to-r from-community-accent/10 via-community-accent/5 to-transparent p-3">
            <div className="flex min-w-0 items-start gap-2">
              <Pin
                size={14}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-community-accent"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {channel.pinnedMessage.title}
                </p>
                <p className="line-clamp-1 text-xs text-ink-muted">
                  {channel.pinnedMessage.excerpt}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 cursor-pointer text-xs font-medium text-community-accent hover:underline"
            >
              Xem chi tiết
            </button>
          </div>
        )}

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
                  <p className="text-[11px] text-ink-faint">{post.timeLabel}</p>
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
                      <span className="truncate">{post.attachmentName}</span>
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

        <div className="mt-4 flex flex-col gap-1.5 pb-3">
          {channel.messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-faint">
              Chưa có bài viết nào trong kênh này.
            </p>
          ) : (
            channel.messages.map((message) => (
              <CommunityPostCard key={message.id} message={message} />
            ))
          )}
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <CommunityComposer />
      </div>
    </div>
  );
}
