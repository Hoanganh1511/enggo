import Image from "next/image";
import type { FeedCategoryGroup } from "@/lib/api/feed-categories";
import { ScrollableRow } from "./ScrollableRow";

const TILE_IMAGES = [
  "/assets/images/articles-hub/topic1.jpg",
  "/assets/images/articles-hub/topic2.jpg",
  "/assets/images/articles-hub/topic3.jpg",
  "/assets/images/articles-hub/topic4.jpg",
  "/assets/images/articles-hub/topic5.jpg",
  "/assets/images/articles-hub/topic6.jpg",
];

// Server Component - the chu de THAT (tu feed/categories/tree, da loc san
// nhom hoat dong trong 7 ngay gan nhat o backend), khong phai hashtag hardcode
// nhu source goc. Anh nen chi mang tinh trang tri (topic bank tu source),
// KHONG phai anh that cua tung linh vuc.
export function TopicsRail({ categoryTree }: { categoryTree: FeedCategoryGroup[] }) {
  // Truoc day return null khi rong - AN LUON ca section (khong con h2 "Chủ đề
  // đang hot" phia tren no) ma khong giai thich gi, gay hieu nham "mat noi
  // dung"/loi hien thi. categoryTree chi rong khi backend KHONG co bai nao
  // trong 7 ngay gan nhat (loc "trending" that, xem feed-category.service.ts)
  // - trang thai that, dung hien ro thay vi bien mat am tham.
  if (categoryTree.length === 0) {
    return (
      <p className="py-4 text-[13px] text-[var(--muted)]">
        Chưa có lĩnh vực nào có bài viết mới trong 7 ngày qua.
      </p>
    );
  }

  return (
    <ScrollableRow gapClassName="gap-3">
      {categoryTree.map((group, i) => (
        <div
          key={group.slug}
          className="group relative h-[86px] min-w-[205px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
        >
          <Image
            src={TILE_IMAGES[i % TILE_IMAGES.length]}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/65 via-slate-900/30 to-transparent" />
          <div className="font-content relative flex h-full flex-col justify-center px-4 text-white">
            <span className="text-[14px] font-semibold">{group.name}</span>
            <span className="mt-1 text-[11px] text-white/75">{group.postCount} bài viết</span>
          </div>
        </div>
      ))}
    </ScrollableRow>
  );
}
