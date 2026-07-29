import type { Post } from "@/content/home-feed-mock";
import { ActionButton } from "./ActionButton";
import { getActionBarLayout } from "./action-bar-config";

// Cum action duoi moi post - bo slot (left[] + right?) doi hoan toan theo
// "kind" (xem action-bar-config.tsx), khong con dung chung 1 bo Like/Comment/
// Repost/Save cho moi loai bai nhu truoc.
//
// flex-wrap: 1 vai kind co 3-4 nut kem nhan chu (vd "event": Interested 421 +
// Like + Comment + Share) - tren the hep (masonry minColumnWidth 280-320px)
// tong do rong co the vuot khung neu bat wrap. flex-wrap cho phep nut cuoi
// rot xuong dong 2 thay vi tran ngang ra ngoai card.
export function ActionBar({ post }: { post: Post }) {
  const { left, right } = getActionBarLayout(post);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {left.map((slot) => (
        <ActionButton key={slot.key} slot={slot} />
      ))}
      {right && (
        <>
          <div className="flex-1" />
          <ActionButton slot={right} />
        </>
      )}
    </div>
  );
}
