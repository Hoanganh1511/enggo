import Image from "next/image";
import {
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share2,
  Plus,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityKnowledgeGems } from "./CommunityKnowledgeGems";
import { CommunityPostAuthorRail } from "./CommunityPostAuthorRail";
import { CommunitySkillChips } from "./CommunitySkillChips";
import type { ChannelMessage } from "@/lib/community/types";
import { useState, useTransition } from "react";
import { toggleReactionAction } from "@/actions/community/toggle-reaction";
import { CommunityCommentThread } from "./CommunityCommentThread";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Bo emoji nhanh cho nut "+" (them reaction moi) - toggle cung 1 emoji lan 2
// se BO reaction do (backend tu xu ly), nen day dong thoi la "them" lan "go".
const QUICK_EMOJIS = ["👍", "❤️", "😄", "🎉", "🚀", "👏", "🔥", "💡"];
// 1 "bai viet" trong danh sach feed cua kenh - thiet ke lai theo huong
// "professional learning community" (Linear/GitHub/Notion/Discord-density),
// KHONG phai kieu Facebook: cot trai co dinh (CommunityPostAuthorRail.tsx)
// the hien do tin cay cua tac gia (level/XP/dong gop), cot phai la noi dung.
// Tat ca field lien quan profile/tag/dinh kem deu OPTIONAL - khong co thi tu
// rut gon (xem message m2 trong series-mock.ts).
export function CommunityPostCard({ message }: { message: ChannelMessage }) {
  const profile = message.author.profile;
  const [reactions, setReactions] = useState(message.reactions);
  const [threadOpen, setThreadOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, startTransition] = useTransition();
  function handleReact(emoji: string) {
    startTransition(async () => {
      const updated = await toggleReactionAction(message.id, emoji);
      setReactions(updated);
    });
  }
  return (
    <div className=" border rounded-md border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(50,50,93,0.06)] transition-transform duration-[180ms] ease-out ">
      <div className="flex gap-4">
        <CommunityPostAuthorRail
          avatarUrl={message.author.avatarUrl}
          name={message.author.name}
          profile={profile}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {/* Avatar nho - CHI hien khi cot trai an (duoi 768px) */}
              <Image
                src={message.author.avatarUrl}
                alt={message.author.name}
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover md:hidden"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[15px] font-semibold text-ink">
                    {message.author.name}
                  </span>
                  {message.authorBadge && (
                    <span className="shrink-0 rounded-full bg-community-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-community-accent">
                      {message.authorBadge}
                    </span>
                  )}
                  {profile ? (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-warning">
                      <Star size={10} strokeWidth={2} fill="currentColor" />
                      {profile.contributorLabel}
                    </span>
                  ) : (
                    <CommunityKnowledgeGems
                      branches={message.author.knowledgeBranches}
                    />
                  )}
                </div>
                <p className="text-xs text-ink-faint">
                  {message.timeLabel}
                  {message.actionLabel && <> · {message.actionLabel}</>}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                aria-label="Thêm"
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
              >
                <MoreHorizontal size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {profile && (
            <div className="mt-3">
              <CommunitySkillChips
                branches={message.author.knowledgeBranches}
              />
            </div>
          )}

          {message.categoryTag && (
            <span className="mt-[18px] inline-block rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              {message.categoryTag}
            </span>
          )}

          {message.title && (
            <p
              className={cn(
                "text-[26px] leading-tight font-bold text-ink",
                message.categoryTag ? "mt-2" : "mt-[18px]",
              )}
            >
              {message.title}
            </p>
          )}

          <p className="mt-[18px] text-[15px] leading-[1.75] text-ink/85">
            {message.content}
          </p>

          {message.bulletPoints && message.bulletPoints.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5 text-[15px] leading-[1.75] text-ink/85">
              {message.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="shrink-0">✅</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}

          {message.codeBlock && (
            <div className="mt-[18px] overflow-hidden rounded-xl border border-black/6">
              <div className="flex items-center justify-between bg-surface-muted px-3 py-1.5 text-xs text-ink-faint">
                <span>{message.codeBlock.language}</span>
              </div>
              <pre className="overflow-x-auto bg-ink px-3 py-2.5 text-xs text-white">
                <code>{message.codeBlock.code}</code>
              </pre>
            </div>
          )}

          {message.imageUrl && (
            <div className="relative mt-[18px] h-40 w-full max-w-xs overflow-hidden rounded-xl border border-black/6 sm:h-48">
              <Image
                src={message.imageUrl}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}

          {message.attachmentName && (
            <div className="mt-[18px] flex w-fit items-center gap-3 rounded-2xl border border-black/6 p-3 shadow-[0_2px_8px_rgba(50,50,93,0.04)] transition-shadow duration-150 ease-out hover:shadow-[0_6px_20px_rgba(50,50,93,0.08)]">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-[10px] font-bold text-danger">
                PDF
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {message.attachmentName}
                </p>
                {message.attachmentMeta && (
                  <p className="text-xs text-ink-faint">
                    {message.attachmentMeta}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-[18px] flex flex-wrap items-center gap-1.5 border-t border-black/6 pt-4">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => handleReact(reaction.emoji)}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-black/3 px-3 text-sm font-semibold text-ink-muted transition-transform duration-150 ease-out hover:bg-community-accent/8 hover:text-community-accent hover:scale-[1.08]"
              >
                <span className="text-base">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
            <PopoverRoot open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Thêm reaction"
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/6 text-ink-faint transition-colors duration-150 ease-out hover:bg-community-accent/8 hover:text-community-accent"
                >
                  <Plus size={12} strokeWidth={2} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                open={pickerOpen}
                align="start"
                className="z-50 flex items-center gap-1 rounded-full border border-border bg-surface p-1.5 shadow-dropdown"
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      handleReact(emoji);
                      setPickerOpen(false);
                    }}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-lg transition-transform duration-150 ease-out hover:scale-125 hover:bg-hover-bg"
                  >
                    {emoji}
                  </button>
                ))}
              </PopoverContent>
            </PopoverRoot>

            <div className="ml-auto flex shrink-0 items-center gap-3 text-ink-faint">
              {message.replyCount > 0 && (
                <button
                  type="button"
                  onClick={() => setThreadOpen((v) => !v)}
                  className="flex cursor-pointer items-center gap-1 text-xs font-medium hover:text-ink"
                >
                  <MessageCircle size={14} strokeWidth={2} />
                  {message.replyCount}
                </button>
              )}
              <button
                type="button"
                aria-label="Lưu bài viết"
                className="cursor-pointer hover:text-ink"
              >
                <Bookmark size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Chia sẻ"
                className="cursor-pointer hover:text-ink"
              >
                <Share2 size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Thêm"
                className="cursor-pointer hover:text-ink"
              >
                <MoreHorizontal size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {message.topReply && (
            <div className="mt-3 rounded-xl bg-surface-muted p-3">
              <div className="flex items-center gap-2">
                <Image
                  src={message.topReply.author.avatarUrl}
                  alt={message.topReply.author.name}
                  width={24}
                  height={24}
                  className="size-6 shrink-0 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-ink">
                  {message.topReply.author.name}
                </span>
                {message.topReply.authorBadge && (
                  <span className="shrink-0 rounded-full bg-community-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-community-accent">
                    {message.topReply.authorBadge}
                  </span>
                )}
                <span className="text-xs text-ink-faint">
                  {message.topReply.timeLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/85">
                {message.topReply.content}
              </p>
              {message.topReply.moreCount > 0 && (
                <button
                  type="button"
                  className="mt-1 cursor-pointer text-xs font-medium text-community-accent hover:underline"
                >
                  Xem thêm {message.topReply.moreCount} phản hồi
                </button>
              )}
            </div>
          )}
        </div>
        {threadOpen && <CommunityCommentThread postId={message.id} />}
      </div>
    </div>
  );
}
