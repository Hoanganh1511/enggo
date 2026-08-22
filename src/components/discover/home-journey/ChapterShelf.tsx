import { SectionHeader } from "@/components/discover/home-feed/SectionHeader";
import { HorizontalScroller } from "@/components/discover/home-feed/HorizontalScroller";
import { ChapterCard, AddChapterCard } from "./ChapterCard";
import type { ApiJourneyGroup } from "@/lib/api/types";

// "Ke sach" - hang carousel cac nhom kien thuc (ChapterCard) cua viewer, dung
// chung HorizontalScroller/SectionHeader nhu moi hang khac cua EditorialFeed.
// 0 nhom -> chi 1 the moi bat dau (khong hien hang rong).
export function ChapterShelf({
  groups,
  username,
}: {
  groups: ApiJourneyGroup[];
  username: string;
}) {
  return (
    <section>
      <SectionHeader title="📖 Cuốn sách của tôi" />
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
    </section>
  );
}
