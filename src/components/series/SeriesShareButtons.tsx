"use client";

import { Link2 } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";

const CHANNEL_META: Record<
  string,
  { label: string; shortLabel: string; shareUrl?: (url: string, title: string) => string }
> = {
  x: {
    label: "X",
    shortLabel: "X",
    shareUrl: (url, title) => `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  bluesky: {
    label: "Bluesky",
    shortLabel: "BS",
    shareUrl: (url, title) => `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  linkedin: {
    label: "LinkedIn",
    shortLabel: "in",
    shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  copy: { label: "Copy link", shortLabel: "" },
};

// Kenh chia se CONFIGURABLE tu Series.shareChannels (dac ta muc 2.2.8) -
// "copy" luon xu ly rieng (clipboard, khong mo tab moi), cac kenh con lai mo
// intent link chuan cua tung mang xa hoi. `compact` (yeu cau nguoi dung) -
// ban icon-vuong-nho GON hon cho cot TOC hep ben phai, KHAC ban pill+label
// mac dinh dat cuoi bai (EntryExtras) - dung CHUNG 1 CHANNEL_META/handleClick
// de khong lap logic mo intent link 2 lan.
export function SeriesShareButtons({
  channels,
  url,
  title,
  compact = false,
}: {
  channels: string[];
  url: string;
  title: string;
  compact?: boolean;
}) {
  function handleClick(channel: string) {
    if (channel === "copy") {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success("Đã copy link"))
        .catch(() => toast.danger("Không copy được, thử lại sau."));
      return;
    }
    const meta = CHANNEL_META[channel];
    if (meta?.shareUrl) window.open(meta.shareUrl(url, title), "_blank", "noopener,noreferrer");
  }

  const active = channels.filter((c) => CHANNEL_META[c]);
  if (active.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {active.map((channel) => (
          <button
            key={channel}
            type="button"
            title={CHANNEL_META[channel].label}
            onClick={() => handleClick(channel)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-border text-[11px] font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            {channel === "copy" ? (
              <Link2 size={13} aria-hidden="true" />
            ) : (
              CHANNEL_META[channel].shortLabel
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((channel) => (
        <button
          key={channel}
          type="button"
          onClick={() => handleClick(channel)}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          {channel === "copy" && <Link2 size={14} aria-hidden="true" />}
          {CHANNEL_META[channel].label}
        </button>
      ))}
    </div>
  );
}
