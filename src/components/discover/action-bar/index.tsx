import type { Post } from "@/content/home-feed-mock";
import { ActionButton } from "./ActionButton";
import { getActionBarLayout } from "./action-bar-config";

// Cum action duoi moi post - bo slot (left[] + right?) doi hoan toan theo
// "kind" (xem action-bar-config.tsx), khong con dung chung 1 bo Like/Comment/
// Repost/Save cho moi loai bai nhu truoc.
export function ActionBar({ post }: { post: Post }) {
  const { left, right } = getActionBarLayout(post);
  return (
    <div className="mt-3 flex items-center gap-1">
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
