import type { Post } from "@/content/home-feed-mock";
import { PostBody } from "@/components/discover/post-bodies";
import { getPostContentText, parseContentLines } from "@/lib/discover/article-content";

// Kind co van ban tho (text/image/gallery/video/file/link/resource/note) ->
// tu parse heading/doan van tu content that (xem article-content.ts), khop
// id voi ArticleTableOfContents.tsx. Kind KHONG co content dang van ban
// (project-update/achievement/poll/career-update/...) -> fallback ve
// PostBody co san (component nay da biet render dung dang rieng cua tung
// kind do, khong can viet lai).
export function ArticleBody({ post }: { post: Post }) {
  const content = getPostContentText(post);
  if (!content) return <PostBody post={post} />;

  const lines = parseContentLines(content);

  return (
    <div className="flex flex-col gap-4">
      {lines.map((line, i) => {
        if (line.type === "heading") {
          const Tag = line.level === 2 ? "h2" : "h3";
          return (
            <Tag
              key={line.id}
              id={line.id}
              className={
                line.level === 2
                  ? "mt-2 scroll-mt-4 text-xl font-bold tracking-tight text-ink"
                  : "mt-1 scroll-mt-4 text-lg font-semibold tracking-tight text-ink"
              }
            >
              {line.text}
            </Tag>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-relaxed whitespace-pre-line text-ink">
            {line.text}
          </p>
        );
      })}
    </div>
  );
}
