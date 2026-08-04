import Image from "next/image";
import Link from "next/link";
import { Flame, FileText, Sparkles } from "lucide-react";
import type { Community } from "@/content/community-mock";
import { ProgressBar } from "@/components/ui/progress-bar";

// Cot phai trang chi tiet cong dong - thu thach dang chay, bang xep hang rut
// gon, tai lieu moi, CTA "can giup do". Tat ca CHI doc mock (xem
// community-mock.ts) - cung tinh than voi cot trai.
export function CommunitySidebarRight({ community }: { community: Community }) {
  return (
    <aside id="leaderboard" className="flex w-80 shrink-0 flex-col gap-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Thử thách đang diễn ra</p>
          <Link href="#" className="text-xs font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <Flame size={17} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold text-ink">
              {community.challenge.title}
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">
              Ngày {community.challenge.currentDay}/{community.challenge.totalDays}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar
                percent={community.challenge.progressPercent}
                className="flex-1"
              />
              <span className="shrink-0 text-xs font-medium text-ink-muted">
                {community.challenge.progressPercent}%
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-ink-faint">
            {community.challenge.participantCount} người tham gia
          </span>
          <button
            type="button"
            className="flex h-7 cursor-pointer items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            {community.challenge.joined ? "Đã tham gia" : "Tham gia"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Top thành viên tích cực</p>
          <Link href="#" className="text-xs font-medium text-primary hover:underline">
            Xem bảng xếp hạng
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {community.leaderboard.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-2.5">
              <span
                className={`w-4 shrink-0 text-center text-xs font-bold ${
                  entry.rank <= 3 ? "text-warning" : "text-ink-faint"
                }`}
              >
                {entry.rank}
              </span>
              <Image
                src={entry.avatarUrl}
                alt={entry.name}
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {entry.name}
              </span>
              <span className="shrink-0 text-xs font-medium text-ink-faint">
                {entry.points.toLocaleString("vi-VN")} điểm
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community sinh tu Series chua co du lieu tai lieu that - an han
          khoi thay vi hien danh sach rong (xem CommunitySidebarLeft.tsx,
          cung ly do voi khoi chung chi/su kien). */}
      {community.documents.length > 0 && (
        <div id="documents" className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Tài liệu mới cập nhật</p>
            <Link href="#" className="text-xs font-medium text-primary hover:underline">
              Xem thêm
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {community.documents.map((doc) => (
              <Link
                key={doc.title}
                href="#"
                className="flex items-start gap-2.5 rounded-md transition-colors duration-150 ease-out hover:text-primary"
              >
                <FileText
                  size={16}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0 text-ink-faint"
                />
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-sm font-medium text-ink">
                    {doc.title}
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    {doc.updatedLabel}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface p-4 text-center">
        <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles size={17} strokeWidth={2} />
        </span>
        <p className="mt-2 text-sm font-semibold text-ink">Bạn cần giúp đỡ?</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          Đặt câu hỏi, cộng đồng sẽ hỗ trợ bạn!
        </p>
        <button
          type="button"
          className="mt-3 h-8 w-full cursor-pointer rounded-md bg-primary text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        >
          Tạo bài viết
        </button>
      </div>
    </aside>
  );
}
