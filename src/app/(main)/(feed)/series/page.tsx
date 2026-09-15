import Link from "next/link";
import { Plus } from "lucide-react";
import { listContentSeriesAction } from "@/actions/discover/content-series/list-content-series";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { SeriesListManager } from "@/components/series/SeriesListManager";

export default async function SeriesListPage() {
  const [seriesList, status] = await Promise.all([
    listContentSeriesAction(),
    getSelfStatusAction(),
  ]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* font-content: tieu de trang + mo ta la NOI DUNG - nut "New Series"
            ben canh la UI, KHONG boc. */}
        <div className="font-content">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Series</h1>
          <p className="mt-1.5 text-[14px] text-ink-faint">
            Các chuỗi bài/khoá kỹ năng nhiều phần - đọc theo đúng thứ tự để đi từ cơ bản đến nâng cao.
          </p>
        </div>
        {status.isAdmin && (
          <Link
            href="/series/new"
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-surface transition hover:opacity-90"
          >
            <Plus size={14} /> New Series
          </Link>
        )}
      </div>

      {seriesList.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-faint">Chưa có series nào.</p>
      ) : (
        <SeriesListManager seriesList={seriesList} isAdmin={status.isAdmin} />
      )}
    </div>
  );
}
