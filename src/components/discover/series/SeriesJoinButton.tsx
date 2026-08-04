"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";

import type { Series } from "@/content/series-mock";
import { cn } from "@/lib/utils";
import { JoinRequestModal } from "./JoinRequestModal";

// Nut hanh dong chinh cua 1 series - dung CHUNG cho ca the o trang danh sach
// va hero o trang chi tiet, vi logic 4 trang thai (chu series / chua xin /
// dang cho duyet / da duoc nhan) giong het nhau, chi khac kich thuoc.
export function SeriesJoinButton({
  series,
  className,
}: {
  series: Series;
  className?: string;
}) {
  const [status, setStatus] = useState(series.joinStatus);
  const [modalOpen, setModalOpen] = useState(false);

  const base = cn(
    "flex h-8 shrink-0 items-center justify-center rounded-sm px-3 text-xs font-semibold transition-colors duration-150 ease-out",
    className,
  );

  if (series.isOwner) {
    return (
      <Link
        href={`/community/${series.slug}`}
        className={cn(base, "bg-surface-muted text-ink hover:bg-hover-bg")}
      >
        Quản lý series
      </Link>
    );
  }

  if (status === "approved") {
    return (
      <Link
        href={`/community/${series.slug}`}
        className={cn(base, "bg-surface-muted text-ink hover:bg-hover-bg")}
      >
        Tiếp tục
      </Link>
    );
  }

  if (status === "pending") {
    return (
      <span
        className={cn(
          base,
          "gap-1.5 border border-border text-ink-faint",
        )}
      >
        <Clock3 size={12} strokeWidth={2} />
        Đang chờ duyệt
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          base,
          "cursor-pointer bg-primary text-white hover:bg-primary-hover",
        )}
      >
        Xin tham gia
      </button>
      <JoinRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        seriesTitle={series.title}
        authorName={series.author.name}
        onSubmitted={() => setStatus("pending")}
      />
    </>
  );
}
