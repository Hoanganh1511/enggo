"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityViewerStatus } from "@/lib/api/types";
import { joinCommunityAction } from "@/actions/community/join-community";

// Nut hanh dong duy nhat cua 1 community o trang danh sach - la CACH DUY NHAT
// de vao / xin vao cong dong (than the card KHONG dieu huong, xem
// CommunityDiscoveryCard.tsx). Rule 4 trang thai:
//   - member  -> "Vào cộng đồng" (link toi trang cong dong)
//   - pending -> "Đang chờ duyệt" (khong bam duoc, cho quan tri duyet)
//   - none + cong khai -> "Tham gia" (vao ngay -> member)
//   - none + rieng tu   -> "Xin tham gia" (-> pending)
// KHONG gia dinh "bam la vao ngay": doc `status` API tra ve de biet thanh
// member (APPROVED) hay pending (PENDING).
export function CommunityJoinButton({
  communityId,
  slug,
  isPublic,
  viewerStatus,
  className,
}: {
  communityId: string;
  slug: string;
  isPublic: boolean;
  viewerStatus: CommunityViewerStatus;
  className?: string;
}) {
  const [status, setStatus] = useState<CommunityViewerStatus>(viewerStatus);
  const [isPending, startTransition] = useTransition();

  const base = cn(
    "flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs font-semibold transition-colors duration-150 ease-out",
    className,
  );

  if (status === "member") {
    return (
      <Link
        href={`/communities/${slug}`}
        className={cn(base, "bg-surface-muted text-ink hover:bg-hover-bg")}
      >
        Vào cộng đồng
      </Link>
    );
  }

  if (status === "pending") {
    return (
      <span className={cn(base, "gap-1.5 border border-border text-ink-faint")}>
        <Clock3 size={12} strokeWidth={2} />
        Đang chờ duyệt
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const member = await joinCommunityAction(communityId, slug);
          setStatus(member.status === "APPROVED" ? "member" : "pending");
        })
      }
      className={cn(
        base,
        "cursor-pointer bg-community-accent text-white hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {isPending ? "Đang gửi..." : isPublic ? "Tham gia" : "Xin tham gia"}
    </button>
  );
}
