import { ChevronRight } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";

// Breadcrumb "danh muc kien thuc" dung chung cho ca 2 variant cua PostCard -
// doan cuoi (chu de cu the) in dam + mau accent, cac doan truoc (danh muc
// lon) hien thuong mau text-ink-faint. Chi render khi post.topic ton tai
// (skill-report dung breadcrumb rieng trong SkillReportBody.tsx, khong qua
// day).
export function TopicBreadcrumb({ topic }: { topic: NonNullable<Post["topic"]> }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-ink-faint">
      {topic.path.map((segment, i) => {
        const isLast = i === topic.path.length - 1;
        return (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && (
              <ChevronRight size={11} strokeWidth={2} className="shrink-0" />
            )}
            <span
              className={isLast ? "truncate font-semibold" : "truncate"}
              style={isLast ? { color: topic.accent } : undefined}
            >
              {segment}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default TopicBreadcrumb;
