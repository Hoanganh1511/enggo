import Image from "next/image";
import { MessageCircle, Bookmark, MoreHorizontal, Share2, Plus } from "lucide-react";
import type { ChannelMessage } from "@/content/community-mock";
import { cn } from "@/lib/utils";
import { CommunityKnowledgeGems } from "./CommunityKnowledgeGems";

// 1 "bai viet" trong danh sach feed cua kenh. Co "message.title" -> hien nhu
// bai viet dien dan day du (badge phu, tag chu de, khung XP/progress, xem
// truoc 1 phan hoi) - CAC FIELD NAY DEU LA OPTIONAL, khong co thi tu rut gon
// lai giong 1 phan hoi don gian (xem message m2 trong community-mock.ts) nen
// mat do feed van linh hoat tuy tung bai, khong bat buoc moi bai deu "day".
export function CommunityPostCard({ message }: { message: ChannelMessage }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <Image
            src={message.author.avatarUrl}
            alt={message.author.name}
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-ink">{message.author.name}</span>
              {message.authorBadge && (
                <span className="shrink-0 rounded-full bg-community-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-community-accent">
                  {message.authorBadge}
                </span>
              )}
              {message.authorTitle && (
                <span className="text-xs text-ink-faint">· {message.authorTitle}</span>
              )}
              <CommunityKnowledgeGems branches={message.author.knowledgeBranches} />
            </div>
            <p className="text-xs text-ink-faint">
              {message.timeLabel}
              {message.actionLabel && <> · {message.actionLabel}</>}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {message.topicTag && (
            <span className="hidden rounded-full bg-community-accent/10 px-2.5 py-1 text-[11px] font-medium text-community-accent sm:inline-block">
              {message.topicTag}
            </span>
          )}
          <button
            type="button"
            aria-label="Thêm"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className={cn("mt-3 flex gap-4", message.xp && "flex-col sm:flex-row")}>
        <div className="min-w-0 flex-1">
          {message.categoryTag && (
            <span className="inline-block rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              {message.categoryTag}
            </span>
          )}
          {message.title && (
            <p className="mt-1.5 text-base font-bold text-ink">{message.title}</p>
          )}
          <p className="mt-1 text-sm leading-relaxed text-ink/85">{message.content}</p>

          {message.bulletPoints && message.bulletPoints.length > 0 && (
            <ul className="mt-1.5 flex flex-col gap-1 text-sm leading-relaxed text-ink/85">
              {message.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="shrink-0">✅</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}

          {message.codeBlock && (
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <div className="flex items-center justify-between bg-surface-muted px-3 py-1.5 text-xs text-ink-faint">
                <span>{message.codeBlock.language}</span>
              </div>
              <pre className="overflow-x-auto bg-ink px-3 py-2.5 text-xs text-white">
                <code>{message.codeBlock.code}</code>
              </pre>
            </div>
          )}

          {message.imageUrl && (
            <div className="relative mt-2 h-40 w-full max-w-xs overflow-hidden rounded-lg border border-border sm:h-48">
              <Image src={message.imageUrl} alt="" fill className="object-cover" />
            </div>
          )}

          {message.attachmentName && (
            <div className="mt-2 flex w-fit items-center gap-2.5 rounded-lg border border-border p-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-danger/10 text-[10px] font-bold text-danger">
                PDF
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{message.attachmentName}</p>
                {message.attachmentMeta && (
                  <p className="text-xs text-ink-faint">{message.attachmentMeta}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {message.xp && (
          <div className="shrink-0 rounded-xl border border-community-accent/10 bg-community-accent/5 p-3 sm:w-48">
            <p className="flex items-center gap-1 text-sm font-bold text-community-accent">
              🏆 +{message.xp.amount} XP
            </p>
            <p className="text-xs text-ink-faint">{message.xp.label}</p>
            {message.progressPercent !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-ink-faint">
                  <span>Progress</span>
                  <span>{message.progressPercent}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-community-accent"
                    style={{ width: `${message.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {message.reactions.map((reaction) => (
          <span
            key={reaction.emoji}
            className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-ink-muted"
          >
            {reaction.emoji} {reaction.count}
          </span>
        ))}
        <button
          type="button"
          aria-label="Thêm reaction"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-ink-faint hover:bg-hover-bg hover:text-ink"
        >
          <Plus size={13} strokeWidth={2} />
        </button>

        {message.replyCount > 0 && (
          <span className="ml-1 flex items-center gap-1 text-xs text-ink-muted">
            <MessageCircle size={13} strokeWidth={2} />
            {message.replyCount} phản hồi
          </span>
        )}

        <button
          type="button"
          aria-label="Chia sẻ"
          className="ml-auto cursor-pointer text-ink-faint hover:text-ink"
        >
          <Share2 size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Lưu bài viết"
          className="cursor-pointer text-ink-faint hover:text-ink"
        >
          <Bookmark size={14} strokeWidth={2} />
        </button>
      </div>

      {message.topReply && (
        <div className="mt-3 rounded-lg bg-surface-muted p-3">
          <div className="flex items-center gap-2">
            <Image
              src={message.topReply.author.avatarUrl}
              alt={message.topReply.author.name}
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="text-sm font-semibold text-ink">{message.topReply.author.name}</span>
            {message.topReply.authorBadge && (
              <span className="shrink-0 rounded-full bg-community-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-community-accent">
                {message.topReply.authorBadge}
              </span>
            )}
            <span className="text-xs text-ink-faint">{message.topReply.timeLabel}</span>
          </div>
          <p className="mt-1 text-sm text-ink/85">{message.topReply.content}</p>
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
  );
}
