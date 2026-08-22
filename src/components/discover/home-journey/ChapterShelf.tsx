import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HorizontalScroller } from "@/components/discover/home-feed/HorizontalScroller";
import { ChapterCard, AddChapterCard } from "./ChapterCard";
import type { ApiJourneyGroup } from "@/lib/api/types";

// "Ke sach" - hang carousel cac nhom kien thuc (ChapterCard) cua viewer.
// Header + vien "go" mau nau duoi PHONG DUNG ban mau tree-career-book-ui goc
// (khong dung SectionHeader chuan cua EditorialFeed - mau/font khac tong voi
// phan con lai cua widget nay). 0 nhom -> chi 1 the moi bat dau (khong hien
// hang rong).
export function ChapterShelf({
  groups,
  username,
}: {
  groups: ApiJourneyGroup[];
  username: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <h2
          className="text-[19px]"
          style={{ fontFamily: "Georgia, serif", fontWeight: 650, color: "#2b2117" }}
        >
          📖 Cuốn sách của tôi
        </h2>
        <Link
          href={`/workspace/${username}`}
          className="ml-auto flex shrink-0 items-center gap-0.5 text-[13px] font-medium transition-colors duration-150 ease-out"
          style={{ color: "#8c6d56" }}
        >
          Xem tất cả chương
          <ChevronRight size={15} strokeWidth={2} />
        </Link>
      </div>
      <div
        className="pb-4"
        style={{
          borderBottom: "12px solid #c88d49",
          boxShadow: "0 8px 12px rgba(97,63,27,.13)",
        }}
      >
        <HorizontalScroller>
          {groups.length === 0 ? (
            <AddChapterCard
              href={`/workspace/${username}`}
              title="Bắt đầu hành trình"
              subtitle="Tạo nhóm kiến thức đầu tiên của bạn"
            />
          ) : (
            <>
              {groups.map((group, i) => (
                <ChapterCard
                  key={group.id}
                  group={group}
                  index={i}
                  username={username}
                />
              ))}
              <AddChapterCard
                href={`/workspace/${username}`}
                title="Thêm chương mới"
                subtitle="Viết tiếp câu chuyện của bạn"
              />
            </>
          )}
        </HorizontalScroller>
      </div>
    </section>
  );
}
