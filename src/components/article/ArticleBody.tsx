import type { Post } from "@/content/home-feed-mock";
import { PostBody } from "@/components/discover/post-bodies";
import {
  getPostContentText,
  parseContentLines,
} from "@/lib/discover/article-content";
import { POST_PROSE_CLASS } from "@/components/workspaces/post-extensions";

// Kind "text" co richContent (JSON Tiptap tu Composer.tsx) -> render HTML
// that (html da duoc render SAN o page.tsx qua renderTiptapHTML(), truyen
// xuong day qua prop `richHtml` - CHUNG 1 lan goi voi ArticleTableOfContents
// (dung `headings` tra ve cung luc), tranh goi renderTiptapHTML() 2 lan cho
// cung 1 bai VA dam bao id heading trong HTML khop tuyet doi voi id trong
// muc luc. Bai cu hon (chua co richContent) hoac cac kind con lai co van ban
// tho (image/gallery/video/file/link/resource/note) -> tu parse heading/doan
// van tu content that (xem article-content.ts), khop id voi
// ArticleTableOfContents.tsx (nhanh content, khong phai nhanh richHeadings).
// Kind KHONG co content dang van ban (project-update/achievement/poll/
// career-update/...) -> fallback ve PostBody co san (component nay da biet
// render dung dang rieng cua tung kind do, khong can viet lai).
export function ArticleBody({ post, richHtml }: { post: Post; richHtml?: string }) {
  if (richHtml) {
    return (
      <div
        className={POST_PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: richHtml }}
      />
    );
  }

  const content = getPostContentText(post);
  if (!content) {
    return (
      <div className="font-content">
        <PostBody post={post} />
      </div>
    );
  }

  const lines = parseContentLines(content);

  return (
    // font-content: than bai la NOI DUNG doc lau, dung Manrope thay
    // --font-sans mac dinh (UI/dieu huong) - xem globals.css --font-content.
    <div className="font-content flex flex-col gap-4">
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
