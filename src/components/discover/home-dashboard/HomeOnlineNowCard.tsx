import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/content/home-feed-mock";
import { EmptyState } from "./EmptyState";

// Widget "Đang hoạt động" - cạnh HomeActivityCard ("Recent activity", chỉ
// hiện thông báo CỦA CHÍNH người xem) trên /home. Server Component thuần,
// SNAPSHOT lúc tải trang (không live qua socket, xem quyết định trong plan)
// - giống hệt tinh thần CreatorRail.tsx ở /articles. `authors` truyền vào
// đã được page.tsx lọc CHỈ còn người đang online thật (qua
// getOnlineStatusAction -> NotificationGateway.isOnline, không phải mock).
export function HomeOnlineNowCard({ authors }: { authors: Author[] }) {
  return (
    <div className="rounded-xl border border-[#edf0f4] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Đang hoạt động</h2>
      </div>
      <div className="mt-4 space-y-3">
        {authors.length === 0 ? (
          <EmptyState message="Không có ai đang hoạt động." />
        ) : (
          authors.map((author) => (
            <Link
              key={author.username}
              href={`/u/${author.username}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <span className="relative inline-flex size-8 shrink-0">
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
              <span className="font-content min-w-0 flex-1 truncate text-[12px] font-medium">
                {author.name}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
