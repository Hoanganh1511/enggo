"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Share2 } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SeriesShareButtons } from "@/components/series/SeriesShareButtons";
import type { ContentSeriesEntrySummary } from "@/lib/api/content-series";

const buttonClass =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-[12.5px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink";

// Cum hang cuoi CUNG cua phan dau bai (truoc khi xuong than bai) - yeu cau
// nguoi dung, khop anh mau tham khao (trang skill cua Matt Pocock): trai la
// tac gia + Follow, phai la Copy page/Share/Next page. Tac gia lay tu
// Series.authorName/authorAvatarUrl (Series KHONG co FK toi 1 User cu the,
// chi la CHUOI TEXT tu do - xem EntryAuthorRail) nen "Follow" O DAY CHUA gan
// logic that (chua co he thong follow tac gia rieng cho Series) - CHI la UI,
// bam vao hien toast "sắp ra mắt" (yeu cau nguoi dung: "Sửa thành Follow đi",
// khong yeu cau gan chuc nang that).
export function EntryPageActionsRow({
  authorName,
  authorAvatarUrl,
  contentMarkdown,
  shareChannels,
  shareUrl,
  shareTitle,
  next,
  seriesSlug,
}: {
  authorName: string;
  authorAvatarUrl: string | null;
  contentMarkdown: string;
  shareChannels: string[];
  shareUrl: string;
  shareTitle: string;
  next: ContentSeriesEntrySummary | null;
  seriesSlug: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);

  function handleCopyPage() {
    navigator.clipboard
      .writeText(contentMarkdown)
      .then(() => toast.success("Đã copy nội dung (markdown)"))
      .catch(() => toast.danger("Không copy được, thử lại sau."));
  }

  return (
    <div className="font-content mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {authorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar nho, khong can toi uu Next/Image
          <img src={authorAvatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[12px] font-semibold text-ink-muted">
            {authorName.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
        <span className="truncate text-[13px] font-medium text-ink">{authorName}</span>
        <button
          type="button"
          onClick={() => toast.info("Tính năng Follow sắp ra mắt")}
          className="flex h-7 shrink-0 cursor-pointer items-center rounded-md border border-border px-2.5 text-[12.5px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          Follow
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={handleCopyPage} className={buttonClass}>
          <Copy size={13} strokeWidth={2} aria-hidden="true" />
          Copy page
        </button>

        <PopoverRoot open={shareOpen} onOpenChange={setShareOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={buttonClass}>
              <Share2 size={13} strokeWidth={2} aria-hidden="true" />
              Share
            </button>
          </PopoverTrigger>
          <PopoverContent
            open={shareOpen}
            align="end"
            sideOffset={6}
            className="z-50 rounded-lg border border-border bg-surface p-2 shadow-dropdown"
          >
            <SeriesShareButtons channels={shareChannels} url={shareUrl} title={shareTitle} />
          </PopoverContent>
        </PopoverRoot>

        {next && (
          <Link href={`/series/${seriesSlug}/${next.slug}`} className={buttonClass}>
            Next page
            <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
