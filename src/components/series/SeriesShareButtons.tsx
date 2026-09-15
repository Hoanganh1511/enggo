"use client";

import { Link2 } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";

const CHANNEL_META: Record<
  string,
  {
    label: string;
    shortLabel: string;
    // Nen circle rieng cho ban "modal" (yeu cau nguoi dung, khop anh mau) -
    // khong dung chung 1 mau trung tinh cho tat ca kenh nhu 2 ban compact/
    // pill cu, ma mo phong dung tinh than brand (X = den/trang, Bluesky/
    // LinkedIn = nen mem mau xanh dam nhat cua chinh brand do).
    circleClassName: string;
    shareUrl?: (url: string, title: string) => string;
  }
> = {
  x: {
    label: "X",
    shortLabel: "X",
    circleClassName: "bg-ink text-white",
    shareUrl: (url, title) => `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  bluesky: {
    label: "Bluesky",
    shortLabel: "BS",
    circleClassName: "bg-[#e8f4fb] text-[#1185cf]",
    shareUrl: (url, title) => `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  linkedin: {
    label: "LinkedIn",
    shortLabel: "in",
    circleClassName: "bg-[#e5f0fb] text-[#0a66c2]",
    shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  copy: { label: "Copy link", shortLabel: "", circleClassName: "bg-surface-muted text-ink-muted" },
};

// Kenh chia se CONFIGURABLE tu Series.shareChannels (dac ta muc 2.2.8) -
// "copy" luon xu ly rieng (clipboard, khong mo tab moi), cac kenh con lai mo
// intent link chuan cua tung mang xa hoi. 3 bien the hien thi dung CHUNG 1
// CHANNEL_META/handleClick de khong lap logic mo intent link nhieu lan:
// - `compact`: icon-vuong-nho cho cot TOC hep ben phai.
// - mac dinh (khong props): pill+label ngang, dat cuoi bai (EntryExtras).
// - `variant="modal"`: circle mau + nhan chu BEN DUOI, dat trong modal Share
//   THAT (SimpleModal, xem EntryPageActionsRow.tsx) - yeu cau nguoi dung:
//   "Khi ấn nút Share trong bài viết nó phải hiện modal như này" (truoc do
//   la 1 popover nho, khong phai modal chinh giua man hinh).
export function SeriesShareButtons({
  channels,
  url,
  title,
  compact = false,
  variant,
}: {
  channels: string[];
  url: string;
  title: string;
  compact?: boolean;
  variant?: "modal";
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

  if (variant === "modal") {
    return (
      <div className="flex flex-wrap gap-4">
        {active.map((channel) => (
          <button
            key={channel}
            type="button"
            onClick={() => handleClick(channel)}
            className="flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5 text-center"
          >
            <span
              className={`flex size-12 items-center justify-center rounded-full text-[15px] font-semibold transition-opacity duration-150 ease-out hover:opacity-85 ${CHANNEL_META[channel].circleClassName}`}
            >
              {channel === "copy" ? (
                <Link2 size={18} aria-hidden="true" />
              ) : (
                CHANNEL_META[channel].shortLabel
              )}
            </span>
            <span className="text-[12px] text-ink-muted">{CHANNEL_META[channel].label}</span>
          </button>
        ))}
      </div>
    );
  }

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
